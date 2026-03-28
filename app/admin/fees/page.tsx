'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2, Calendar, DollarSign, Users, CheckCircle, Clock, AlertCircle, Download, Edit } from 'lucide-react'
import { createFeeStructure, getAllFeeStructures, getAllStudentsWithFees, getFeeStats, deleteFeeStructure, updateFeeStructure, getStudentFeesByClass } from '@/lib/actions/fees'
import { VALID_CLASSES } from '@/constants'
import { validateFeeAmount, validateInstallmentAmount, validateDueDate, validateInstallmentChronologicalOrder, validateInstallmentTotal } from '@/lib/validations'

interface InstallmentData {
  installment_number: number
  amount: number
  due_date: string
}

interface FeeStructureData {
  id: string
  standard: string
  total_amount: number
  number_of_installments: number
}

interface StudentFeeData {
  id: string
  student: {
    id: string
    roll_number: string
    standard: string
    division: string
    user: {
      full_name: string
    }
  }
  total_amount: number
  total_paid: number
  status: 'pending' | 'partial' | 'paid'
}

export default function FeesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [feeStructures, setFeeStructures] = useState<FeeStructureData[]>([])
  const [studentFees, setStudentFees] = useState<StudentFeeData[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createStandard, setCreateStandard] = useState('')
  const [createTotalAmount, setCreateTotalAmount] = useState('')
  const [createInstallments, setCreateInstallments] = useState<InstallmentData[]>([
    { installment_number: 1, amount: 0, due_date: '' }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [classStats, setClassStats] = useState<any>(null)
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFeeStructure, setEditingFeeStructure] = useState<any>(null)
  const [editTotalAmount, setEditTotalAmount] = useState('')
  const [editInstallments, setEditInstallments] = useState<InstallmentData[]>([])

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'admin') {
      router.push('/login')
      return
    }

    setUser(JSON.parse(session))
    loadFeeStructures()
    setLoading(false)
  }, [router])

  const loadFeeStructures = async () => {
    const result = await getAllFeeStructures()
    if (result.success && result.data) {
      setFeeStructures(result.data)
    }
  }

  const loadClassFees = async () => {
    if (!selectedClass) return
    
    const [feesResult, statsResult] = await Promise.all([
      getStudentFeesByClass(selectedClass),
      getFeeStats(selectedClass)
    ])
    
    if (feesResult.success && feesResult.data) {
      setStudentFees(feesResult.data)
    }
    
    if (statsResult.success && statsResult.data) {
      setClassStats(statsResult.data)
    }
  }

  useEffect(() => {
    if (selectedClass) {
      loadClassFees()
    }
  }, [selectedClass])

  const handleEditClick = async (feeStructure: any) => {
    setEditingFeeStructure(feeStructure)
    setEditTotalAmount(feeStructure.total_amount.toString())
    setEditInstallments(feeStructure.installments.map((inst: any) => ({
      installment_number: inst.installment_number,
      amount: inst.amount,
      due_date: inst.due_date
    })))
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee structure? This will also delete all student fee records for this structure.')) {
      return
    }
    
    const result = await deleteFeeStructure(id)
    if (result.success) {
      loadFeeStructures()
      if (selectedClass) {
        loadClassFees()
      }
    } else {
      alert(result.error || 'Failed to delete fee structure')
    }
  }

  const handleUpdateFeeStructure = async () => {
    if (!editingFeeStructure) return

    const errors: string[] = []
    const newFieldErrors: Record<string, string> = {}
    const totalAmount = Number(editTotalAmount)

    if (!totalAmount || totalAmount <= 0) {
      errors.push('Total amount is required')
      newFieldErrors.totalAmount = 'Total amount is required'
    }

    const installmentAmounts = editInstallments.map(i => i.amount)
    const sum = installmentAmounts.reduce((acc, amt) => acc + amt, 0)
    
    if (sum !== totalAmount) {
      errors.push(`Sum of installments must equal total amount`)
      newFieldErrors.installments = `Sum of installments (₹${sum}) must equal total amount (₹${totalAmount})`
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      setFieldErrors(newFieldErrors)
      return
    }

    setIsSubmitting(true)

    const result = await updateFeeStructure({
      id: editingFeeStructure.id,
      standard: editingFeeStructure.standard,
      total_amount: totalAmount,
      number_of_installments: editInstallments.length,
      installments: editInstallments,
      created_by: user.id
    })

    setIsSubmitting(false)

    if (result.success) {
      setIsEditDialogOpen(false)
      setEditingFeeStructure(null)
      loadFeeStructures()
      if (selectedClass) {
        loadClassFees()
      }
    } else {
      alert(result.error || 'Failed to update fee structure')
    }
  }

  const handleAddInstallment = () => {
    const newNumber = createInstallments.length + 1
    setCreateInstallments([
      ...createInstallments,
      { installment_number: newNumber, amount: 0, due_date: '' }
    ])
  }

  const handleRemoveInstallment = (index: number) => {
    const updated = createInstallments.filter((_, i) => i !== index)
    setCreateInstallments(updated.map((inst, i) => ({ ...inst, installment_number: i + 1 })))
  }

  const handleInstallmentChange = (index: number, field: keyof InstallmentData, value: string | number) => {
    const updated = [...createInstallments]
    if (field === 'amount') {
      updated[index].amount = Number(value)
    } else if (field === 'due_date') {
      updated[index].due_date = String(value)
    } else if (field === 'installment_number') {
      updated[index].installment_number = Number(value)
    }
    setCreateInstallments(updated)
  }

  const handleDistributeEqually = () => {
    const total = Number(createTotalAmount)
    if (total <= 0 || createInstallments.length === 0) return
    
    const perInstallment = Math.floor(total / createInstallments.length)
    const remainder = total % createInstallments.length
    
    const distributed = createInstallments.map((inst, i) => ({
      ...inst,
      amount: perInstallment + (i < remainder ? 1 : 0)
    }))
    setCreateInstallments(distributed)
  }

  const handleCreateFeeStructure = async () => {
    const errors: string[] = []
    const newFieldErrors: Record<string, string> = {}

    if (!createStandard) {
      errors.push('Please select a class')
      newFieldErrors.standard = 'Class is required'
    }

    const totalAmount = Number(createTotalAmount)
    const amountResult = validateFeeAmount(totalAmount, { fieldName: 'Total fee amount' })
    if (!amountResult.isValid) {
      errors.push(...amountResult.errors)
      newFieldErrors.totalAmount = amountResult.errors[0]
    }

    if (createInstallments.length === 0) {
      errors.push('At least one installment is required')
    } else {
      const dueDates = createInstallments.map(i => i.due_date)
      
      const dateOrderResult = validateInstallmentChronologicalOrder(dueDates)
      if (!dateOrderResult.isValid) {
        errors.push(...dateOrderResult.errors)
      }

      const installmentAmounts = createInstallments.map(i => i.amount)
      const totalMatchResult = validateInstallmentTotal(totalAmount, installmentAmounts)
      if (!totalMatchResult.isValid) {
        errors.push(...totalMatchResult.errors)
        newFieldErrors.installments = totalMatchResult.errors[0]
      }

      createInstallments.forEach((inst, index) => {
        const instAmountResult = validateInstallmentAmount(inst.amount)
        if (!instAmountResult.isValid) {
          errors.push(...instAmountResult.errors.map(e => `Installment ${index + 1}: ${e}`))
          newFieldErrors[`installment_${index}_amount`] = instAmountResult.errors[0]
        }

        const dueDateResult = validateDueDate(inst.due_date, { required: true, allowPast: false })
        if (!dueDateResult.isValid) {
          errors.push(...dueDateResult.errors.map(e => `Installment ${index + 1}: ${e}`))
          newFieldErrors[`installment_${index}_date`] = dueDateResult.errors[0]
        }
      })
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      setFieldErrors(newFieldErrors)
      return
    }

    setValidationErrors([])
    setFieldErrors({})
    setIsSubmitting(true)

    const result = await createFeeStructure({
      standard: createStandard,
      total_amount: totalAmount,
      number_of_installments: createInstallments.length,
      installments: createInstallments,
      created_by: user.id
    })

    setIsSubmitting(false)

    if (result.success) {
      setIsCreateDialogOpen(false)
      resetCreateForm()
      loadFeeStructures()
      if (createStandard === selectedClass) {
        loadClassFees()
      }
    } else {
      const errorMsg = result.error || 'Failed to create fee structure'
      setValidationErrors([errorMsg])
    }
  }

  const resetCreateForm = () => {
    setCreateStandard('')
    setCreateTotalAmount('')
    setCreateInstallments([{ installment_number: 1, amount: 0, due_date: '' }])
    setValidationErrors([])
    setFieldErrors({})
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600">Paid</Badge>
      case 'partial':
        return <Badge className="bg-yellow-600">Partial</Badge>
      case 'pending':
        return <Badge className="bg-red-600">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeSection="fees" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary">Fees Management</h1>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Fee Structure
            </Button>
          </div>

          {/* Fee Structure Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Active Fee Structures</h2>
            {feeStructures.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No fee structures created yet. Click "Create Fee Structure" to add one.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {feeStructures.map((fs) => (
                  <Card key={fs.id} className="border-2 border-primary/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Class {fs.standard}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(fs)}
                            className="h-8 w-8"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(fs.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Fee</span>
                          <span className="font-semibold">{formatCurrency(fs.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Installments</span>
                          <span className="font-semibold">{fs.number_of_installments}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Class Selection and Student Fees */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Student Fee Status</CardTitle>
                <div className="flex items-center gap-4">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_CLASSES.map((cls) => (
                        <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>

            {selectedClass && classStats && (
              <CardContent className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      Total Students
                    </div>
                    <p className="text-2xl font-bold">{classStats.totalStudents}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="w-4 h-4" />
                      Total Fee
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(classStats.totalFeeAmount)}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <CheckCircle className="w-4 h-4" />
                      Total Paid
                    </div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(classStats.totalPaid)}</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <AlertCircle className="w-4 h-4" />
                      Pending
                    </div>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(classStats.totalPending)}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <CheckCircle className="w-4 h-4" />
                      Fully Paid
                    </div>
                    <p className="text-2xl font-bold text-green-600">{classStats.paidCount}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      Partial
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{classStats.partialCount}</p>
                  </div>
                </div>
              </CardContent>
            )}

            <CardContent>
              {!selectedClass ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select a class to view student fee status
                </div>
              ) : studentFees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No fee records found for Class {selectedClass}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Student Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Roll No</th>
                        <th className="text-left py-3 px-4 font-semibold">Division</th>
                        <th className="text-right py-3 px-4 font-semibold">Total Fee</th>
                        <th className="text-right py-3 px-4 font-semibold">Paid</th>
                        <th className="text-right py-3 px-4 font-semibold">Pending</th>
                        <th className="text-center py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentFees.map((student) => (
                        <tr key={student.id} className="border-b border-border hover:bg-accent/5">
                          <td className="py-3 px-4 font-medium">{student.student?.user?.full_name || '-'}</td>
                          <td className="py-3 px-4">{student.student?.roll_number || '-'}</td>
                          <td className="py-3 px-4">{student.student?.division || '-'}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(student.total_amount)}</td>
                          <td className="py-3 px-4 text-right text-green-600">{formatCurrency(student.total_paid)}</td>
                          <td className="py-3 px-4 text-right text-red-600">{formatCurrency(student.total_amount - student.total_paid)}</td>
                          <td className="py-3 px-4 text-center">{getStatusBadge(student.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create Fee Structure Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Fee Structure</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <Label>Class *</Label>
              <Select value={createStandard} onValueChange={(val) => { setCreateStandard(val); setFieldErrors({ ...fieldErrors, standard: '' }) }}>
                <SelectTrigger className={fieldErrors.standard ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.standard && <p className="text-xs text-red-500">{fieldErrors.standard}</p>}
            </div>

            <div className="space-y-2">
              <Label>Total Amount (₹) *</Label>
              <Input
                type="number"
                placeholder="Enter total fee amount (100 - 1,00,00,000)"
                value={createTotalAmount}
                onChange={(e) => { setCreateTotalAmount(e.target.value); setFieldErrors({ ...fieldErrors, totalAmount: '' }) }}
                className={fieldErrors.totalAmount ? 'border-red-500' : ''}
              />
              {fieldErrors.totalAmount && <p className="text-xs text-red-500">{fieldErrors.totalAmount}</p>}
              <p className="text-xs text-muted-foreground">Min: ₹100 | Max: ₹1,00,00,000</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Installments *</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDistributeEqually}
                    disabled={!createTotalAmount || createInstallments.length === 0}
                    className="bg-transparent"
                  >
                    Distribute Equally
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddInstallment}
                    className="bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {createInstallments.map((inst, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {inst.installment_number}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Amount (min ₹100)"
                        value={inst.amount || ''}
                        onChange={(e) => { handleInstallmentChange(index, 'amount', e.target.value); setFieldErrors({ ...fieldErrors, [`installment_${index}_amount`]: '' }) }}
                        className={fieldErrors[`installment_${index}_amount`] ? 'border-red-500 mb-1' : 'mb-1'}
                      />
                      {fieldErrors[`installment_${index}_amount`] && (
                        <p className="text-xs text-red-500 mb-1">{fieldErrors[`installment_${index}_amount`]}</p>
                      )}
                      <Input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={inst.due_date}
                        onChange={(e) => { handleInstallmentChange(index, 'due_date', e.target.value); setFieldErrors({ ...fieldErrors, [`installment_${index}_date`]: '' }) }}
                        className={fieldErrors[`installment_${index}_date`] ? 'border-red-500' : ''}
                      />
                      {fieldErrors[`installment_${index}_date`] && (
                        <p className="text-xs text-red-500 mt-1">{fieldErrors[`installment_${index}_date`]}</p>
                      )}
                    </div>
                    {createInstallments.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveInstallment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {createInstallments.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(createInstallments.reduce((sum, inst) => sum + inst.amount, 0))}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleCreateFeeStructure} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Fee Structure'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fee Structure Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Fee Structure - Class {editingFeeStructure?.standard}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <Label>Total Amount (₹) *</Label>
              <Input
                type="number"
                placeholder="Enter total fee amount"
                value={editTotalAmount}
                onChange={(e) => { setEditTotalAmount(e.target.value); setFieldErrors({ ...fieldErrors, totalAmount: '' }) }}
                className={fieldErrors.totalAmount ? 'border-red-500' : ''}
              />
              {fieldErrors.totalAmount && <p className="text-xs text-red-500">{fieldErrors.totalAmount}</p>}
            </div>

            <div className="space-y-4">
              <Label>Installments</Label>

              <div className="space-y-3">
                {editInstallments.map((inst, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {inst.installment_number}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={inst.amount || ''}
                        onChange={(e) => {
                          const updated = [...editInstallments]
                          updated[index].amount = Number(e.target.value)
                          setEditInstallments(updated)
                        }}
                        className="mb-1"
                      />
                      <Input
                        type="date"
                        value={inst.due_date}
                        onChange={(e) => {
                          const updated = [...editInstallments]
                          updated[index].due_date = e.target.value
                          setEditInstallments(updated)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {editInstallments.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(editInstallments.reduce((sum, inst) => sum + inst.amount, 0))}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingFeeStructure(null); setValidationErrors([]); setFieldErrors({}) }} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleUpdateFeeStructure} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Fee Structure'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
