'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface FeeRecord {
  id: string
  student_id: string
  amount_due: number
  amount_paid: number
  due_date: string
  paid_date?: string
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  payment_method?: string
  remarks?: string
}

interface CreateFeeData {
  student_id: string
  amount_due: number
  due_date: string
  remarks?: string
}

export async function createFeeRecord(data: CreateFeeData): Promise<{
  success: boolean
  data?: FeeRecord
  error?: string
}> {
  try {
    const { data: fee, error } = await supabase
      .from('fees')
      .insert({
        ...data,
        amount_paid: 0,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: fee }
  } catch (error) {
    return { success: false, error: 'Failed to create fee record' }
  }
}

export async function getStudentFees(studentId: string): Promise<{
  success: boolean
  data?: FeeRecord[]
  error?: string
}> {
  try {
    const { data: fees, error } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: fees }
  } catch (error) {
    return { success: false, error: 'Failed to fetch fees' }
  }
}

export async function updatePayment(
  feeId: string,
  amountPaid: number,
  paymentMethod: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Get current fee record
    const { data: fee, error: fetchError } = await supabase
      .from('fees')
      .select('*')
      .eq('id', feeId)
      .single()

    if (fetchError || !fee) {
      return { success: false, error: 'Fee record not found' }
    }

    const totalPaid = fee.amount_paid + amountPaid
    let status: 'pending' | 'partial' | 'paid' | 'overdue' = 'pending'

    if (totalPaid >= fee.amount_due) {
      status = 'paid'
    } else if (totalPaid > 0) {
      status = 'partial'
    }

    const { error } = await supabase
      .from('fees')
      .update({
        amount_paid: totalPaid,
        status,
        payment_method: paymentMethod,
        paid_date: status === 'paid' ? new Date().toISOString() : fee.paid_date,
      })
      .eq('id', feeId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update payment' }
  }
}

export async function getFeeStats(studentId: string): Promise<{
  success: boolean
  data?: {
    totalDue: number
    totalPaid: number
    pending: number
    overdue: number
  }
  error?: string
}> {
  try {
    const { data: fees, error } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)

    if (error) {
      return { success: false, error: error.message }
    }

    const stats = {
      totalDue: fees.reduce((sum, f) => sum + f.amount_due, 0),
      totalPaid: fees.reduce((sum, f) => sum + f.amount_paid, 0),
      pending: fees.filter((f) => f.status === 'pending').length,
      overdue: fees.filter((f) => f.status === 'overdue').length,
    }

    return { success: true, data: stats }
  } catch (error) {
    return { success: false, error: 'Failed to fetch fee stats' }
  }
}

export async function getAllStudentFees(classStandard: string): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const { data: fees, error } = await supabase
      .from('fees')
      .select(
        `
        *,
        student_id (
          id,
          roll_number,
          user_id (
            full_name,
            email
          )
        )
      `
      )
      .eq('student_id.standard', classStandard)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: fees }
  } catch (error) {
    return { success: false, error: 'Failed to fetch class fees' }
  }
}
