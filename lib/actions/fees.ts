'use server'

import { createClient } from '@/lib/supabase'
import { validateFeeAmount, validateInstallmentAmount, validateDueDate, validateInstallmentChronologicalOrder, validateInstallmentTotal, validateNumberOfInstallments } from '@/lib/validations'

const supabase = createClient()

export interface InstallmentData {
  installment_number: number
  amount: number
  due_date: string
}

export interface CreateFeeStructureData {
  standard: string
  total_amount: number
  number_of_installments: number
  installments: InstallmentData[]
  created_by: string
}

function validateFeeStructureInput(data: CreateFeeStructureData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.standard || !['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].includes(data.standard)) {
    errors.push('Invalid class. Must be between 1-12')
  }

  const amountResult = validateFeeAmount(data.total_amount, { fieldName: 'Total fee amount' })
  if (!amountResult.isValid) {
    errors.push(...amountResult.errors)
  }

  const installmentsResult = validateNumberOfInstallments(data.number_of_installments)
  if (!installmentsResult.isValid) {
    errors.push(...installmentsResult.errors)
  }

  if (!data.installments || data.installments.length === 0) {
    errors.push('At least one installment is required')
  } else if (data.installments.length !== data.number_of_installments) {
    errors.push('Number of installments must match the provided installments')
  } else {
    const dueDates = data.installments.map(i => i.due_date)
    const dateOrderResult = validateInstallmentChronologicalOrder(dueDates)
    if (!dateOrderResult.isValid) {
      errors.push(...dateOrderResult.errors)
    }

    const installmentAmounts = data.installments.map(i => i.amount)
    const totalMatchResult = validateInstallmentTotal(data.total_amount, installmentAmounts)
    if (!totalMatchResult.isValid) {
      errors.push(...totalMatchResult.errors)
    }

    data.installments.forEach((inst, index) => {
      const instAmountResult = validateInstallmentAmount(inst.amount)
      if (!instAmountResult.isValid) {
        errors.push(...instAmountResult.errors.map(e => `Installment ${index + 1}: ${e}`))
      }

      const dueDateResult = validateDueDate(inst.due_date, { required: true, allowPast: false })
      if (!dueDateResult.isValid) {
        errors.push(...dueDateResult.errors.map(e => `Installment ${index + 1}: ${e}`))
      }
    })
  }

  return { valid: errors.length === 0, errors }
}

export async function createFeeStructure(data: CreateFeeStructureData): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const validation = validateFeeStructureInput(data)
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') }
    }

    const existingResult = await supabase
      .from('fee_structure')
      .select('id')
      .eq('standard', data.standard)
      .eq('is_active', true)
      .maybeSingle()

    if (existingResult.data) {
      return { success: false, error: `Fee structure for Class ${data.standard} already exists` }
    }

    const installments = data.installments.map(inst => ({
      installment_number: inst.installment_number,
      amount: inst.amount,
      due_date: inst.due_date,
      paid_date: null,
      paid_amount: 0,
      status: 'pending' as const
    }))

    const { data: feeStructure, error } = await supabase
      .from('fee_structure')
      .insert({
        standard: data.standard,
        total_amount: data.total_amount,
        number_of_installments: data.number_of_installments,
        installments,
        is_active: true,
        created_by: data.created_by,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await createStudentFees(feeStructure)

    return { success: true, data: feeStructure }
  } catch (error) {
    return { success: false, error: 'Failed to create fee structure' }
  }
}

async function createStudentFees(feeStructure: any) {
  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('standard', feeStructure.standard)

  if (!students || students.length === 0) return

  const studentFees = students.map((student: { id: string }) => ({
    student_id: student.id,
    fee_structure_id: feeStructure.id,
    total_amount: feeStructure.total_amount,
    total_paid: 0,
    installments: feeStructure.installments,
    status: 'pending'
  }))

  await supabase
    .from('student_fees')
    .insert(studentFees)
}

export async function updateFeeStructure(data: CreateFeeStructureData & { id: string }): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    if (!data.id) {
      return { success: false, error: 'Fee structure ID is required' }
    }

    const validation = validateFeeStructureInput(data)
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') }
    }

    const { data: existingStructure } = await supabase
      .from('fee_structure')
      .select('id')
      .eq('id', data.id)
      .single()

    if (!existingStructure) {
      return { success: false, error: 'Fee structure not found' }
    }

    const installments = data.installments.map(inst => ({
      installment_number: inst.installment_number,
      amount: inst.amount,
      due_date: inst.due_date,
      paid_date: null,
      paid_amount: 0,
      status: 'pending' as const
    }))

    const { data: feeStructure, error } = await supabase
      .from('fee_structure')
      .update({
        total_amount: data.total_amount,
        number_of_installments: data.number_of_installments,
        installments,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await updateStudentFeeInstallments(feeStructure)

    return { success: true, data: feeStructure }
  } catch (error) {
    return { success: false, error: 'Failed to update fee structure' }
  }
}

async function updateStudentFeeInstallments(feeStructure: any) {
  const { data: studentFees } = await supabase
    .from('student_fees')
    .select('*')
    .eq('fee_structure_id', feeStructure.id)

  if (!studentFees) return

  for (const studentFee of studentFees) {
    const hasPayments = studentFee.installments?.some((inst: any) => inst.paid_amount > 0)
    
    if (!hasPayments) {
      await supabase
        .from('student_fees')
        .update({
          total_amount: feeStructure.total_amount,
          installments: feeStructure.installments,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentFee.id)
    }
  }
}

export async function getFeeStructure(standard: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const { data: feeStructure, error } = await supabase
      .from('fee_structure')
      .select('*')
      .eq('standard', standard)
      .eq('is_active', true)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: feeStructure }
  } catch (error) {
    return { success: false, error: 'Failed to fetch fee structure' }
  }
}

export async function getAllFeeStructures(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const { data: feeStructures, error } = await supabase
      .from('fee_structure')
      .select('*')
      .eq('is_active', true)
      .order('standard', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: feeStructures }
  } catch (error) {
    return { success: false, error: 'Failed to fetch fee structures' }
  }
}

export async function deleteFeeStructure(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    if (!id) {
      return { success: false, error: 'Fee structure ID is required' }
    }

    const { data: studentFees } = await supabase
      .from('student_fees')
      .select('id')
      .eq('fee_structure_id', id)

    if (studentFees && studentFees.length > 0) {
      const studentFeeIds = studentFees.map((sf: { id: string }) => sf.id)
      await supabase
        .from('student_fees')
        .delete()
        .in('id', studentFeeIds)
    }

    const { error } = await supabase
      .from('fee_structure')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete fee structure' }
  }
}

export async function getFeeStructureById(id: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    if (!id) {
      return { success: false, error: 'Fee structure ID is required' }
    }

    const { data: feeStructure, error } = await supabase
      .from('fee_structure')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: feeStructure }
  } catch (error) {
    return { success: false, error: 'Failed to fetch fee structure' }
  }
}

export async function getStudentFee(userId: string): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const { data: studentProfile, error: profileError } = await supabase
      .from('students')
      .select('id, standard')
      .eq('user_id', userId)
      .single()

    if (profileError || !studentProfile) {
      return { success: false, error: 'Student profile not found' }
    }

    const { data: feeStructure } = await supabase
      .from('fee_structure')
      .select('*')
      .eq('standard', studentProfile.standard)
      .eq('is_active', true)
      .single()

    if (!feeStructure) {
      return { success: true, data: null }
    }

    let { data: studentFee, error } = await supabase
      .from('student_fees')
      .select(`
        *,
        fee_structure (
          standard
        )
      `)
      .eq('student_id', studentProfile.id)
      .eq('fee_structure_id', feeStructure.id)
      .single()

    if (error && error.message !== 'No rows found') {
      return { success: false, error: error.message }
    }

    if (!studentFee) {
      const { data: newStudentFee, error: insertError } = await supabase
        .from('student_fees')
        .insert({
          student_id: studentProfile.id,
          fee_structure_id: feeStructure.id,
          total_amount: feeStructure.total_amount,
          total_paid: 0,
          installments: feeStructure.installments,
          status: 'pending'
        })
        .select(`
          *,
          fee_structure (
            standard
          )
        `)
        .single()

      if (insertError) {
        return { success: false, error: insertError.message }
      }

      studentFee = newStudentFee
    }

    return { success: true, data: studentFee }
  } catch (error) {
    return { success: false, error: 'Failed to fetch student fee' }
  }
}

export async function getStudentFeesByClass(standard: string): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const { data: feeStructure } = await supabase
      .from('fee_structure')
      .select('*')
      .eq('standard', standard)
      .eq('is_active', true)
      .single()

    if (!feeStructure) {
      return { success: true, data: [] }
    }

    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('standard', standard)

    if (students && students.length > 0) {
      for (const student of students) {
        const { data: existingFee } = await supabase
          .from('student_fees')
          .select('id')
          .eq('student_id', student.id)
          .eq('fee_structure_id', feeStructure.id)
          .maybeSingle()

        if (!existingFee) {
          await supabase
            .from('student_fees')
            .insert({
              student_id: student.id,
              fee_structure_id: feeStructure.id,
              total_amount: feeStructure.total_amount,
              total_paid: 0,
              installments: feeStructure.installments,
              status: 'pending'
            })
        }
      }
    }

    const { data: studentFees, error } = await supabase
      .from('student_fees')
      .select(`
        *,
        student:student_id (
          id,
          roll_number,
          standard,
          division,
          user:user_id (
            full_name
          )
        )
      `)
      .eq('fee_structure_id', feeStructure.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: studentFees }
  } catch (error) {
    return { success: false, error: 'Failed to fetch class fees' }
  }
}

export async function payInstallment(
  studentFeeId: string,
  installmentNumber: number,
  amount: number,
  paymentMethod: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    if (!studentFeeId) {
      return { success: false, error: 'Student fee ID is required' }
    }

    if (!installmentNumber || installmentNumber < 1) {
      return { success: false, error: 'Valid installment number is required' }
    }

    if (!amount || amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than 0' }
    }

    if (!paymentMethod || !['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque'].includes(paymentMethod)) {
      return { success: false, error: 'Valid payment method is required' }
    }

    const { data: studentFee, error: fetchError } = await supabase
      .from('student_fees')
      .select('*')
      .eq('id', studentFeeId)
      .single()

    if (fetchError || !studentFee) {
      return { success: false, error: 'Student fee record not found' }
    }

    const installments = [...(studentFee.installments || [])]
    const installmentIndex = installments.findIndex(
      (inst: any) => inst.installment_number === installmentNumber
    )

    if (installmentIndex === -1) {
      return { success: false, error: 'Installment not found' }
    }

    const installment = installments[installmentIndex]
    
    if (installment.status === 'paid') {
      return { success: false, error: 'This installment is already fully paid' }
    }

    const remainingAmount = installment.amount - installment.paid_amount
    if (amount > remainingAmount) {
      return { success: false, error: `Payment amount cannot exceed remaining amount (₹${remainingAmount.toLocaleString('en-IN')})` }
    }

    const newPaidAmount = installment.paid_amount + amount
    const isFullPayment = newPaidAmount >= installment.amount

    installments[installmentIndex] = {
      ...installment,
      paid_amount: newPaidAmount,
      paid_date: isFullPayment ? new Date().toISOString() : installment.paid_date,
      status: isFullPayment ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending')
    }

    const totalPaid = installments.reduce((sum: number, inst: any) => sum + inst.paid_amount, 0)
    const totalAmount = studentFee.total_amount
    
    let status: 'pending' | 'partial' | 'paid' = 'pending'
    if (totalPaid >= totalAmount) {
      status = 'paid'
    } else if (totalPaid > 0) {
      status = 'partial'
    }

    const { error } = await supabase
      .from('student_fees')
      .update({
        installments,
        total_paid: totalPaid,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentFeeId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to process payment' }
  }
}

export async function getAllStudentsWithFees(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const { data: studentFees, error } = await supabase
      .from('student_fees')
      .select(`
        *,
        student:student_id (
          id,
          roll_number,
          standard,
          division,
          user:user_id (
            full_name
          )
        ),
        fee_structure (
          standard
        )
      `)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: studentFees }
  } catch (error) {
    return { success: false, error: 'Failed to fetch all student fees' }
  }
}

export async function getFeeStats(standard: string): Promise<{
  success: boolean
  data?: {
    totalStudents: number
    totalFeeAmount: number
    totalPaid: number
    totalPending: number
    paidCount: number
    partialCount: number
    pendingCount: number
  }
  error?: string
}> {
  try {
    const { data: feeStructure } = await supabase
      .from('fee_structure')
      .select('id, total_amount')
      .eq('standard', standard)
      .eq('is_active', true)
      .single()

    if (!feeStructure) {
      return { 
        success: true, 
        data: {
          totalStudents: 0,
          totalFeeAmount: 0,
          totalPaid: 0,
          totalPending: 0,
          paidCount: 0,
          partialCount: 0,
          pendingCount: 0
        }
      }
    }

    const { data: studentFees } = await supabase
      .from('student_fees')
      .select('*')
      .eq('fee_structure_id', feeStructure.id)

    if (!studentFees) {
      return { 
        success: true, 
        data: {
          totalStudents: 0,
          totalFeeAmount: 0,
          totalPaid: 0,
          totalPending: 0,
          paidCount: 0,
          partialCount: 0,
          pendingCount: 0
        }
      }
    }

    const stats = {
      totalStudents: studentFees.length,
      totalFeeAmount: studentFees.length * feeStructure.total_amount,
      totalPaid: studentFees.reduce((sum: number, sf: any) => sum + sf.total_paid, 0),
      totalPending: studentFees.reduce((sum: number, sf: any) => sum + (sf.total_amount - sf.total_paid), 0),
      paidCount: studentFees.filter((sf: any) => sf.status === 'paid').length,
      partialCount: studentFees.filter((sf: any) => sf.status === 'partial').length,
      pendingCount: studentFees.filter((sf: any) => sf.status === 'pending').length,
    }

    return { success: true, data: stats }
  } catch (error) {
    return { success: false, error: 'Failed to fetch fee stats' }
  }
}
