'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/StudentSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'

export default function FeesDetailsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'student') {
      router.push('/login')
      return
    }

    setUser(JSON.parse(session))
    setLoading(false)
  }, [router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  const feeStructure = [
    { category: 'Tuition Fee', amount: 50000, frequency: 'Per Year' },
    { category: 'Library Fee', amount: 2000, frequency: 'Per Year' },
    { category: 'Sports Fee', amount: 3000, frequency: 'Per Year' },
    { category: 'Activity Fee', amount: 1500, frequency: 'Per Year' },
    { category: 'Technology Fee', amount: 1000, frequency: 'Per Year' },
  ]

  const totalFeePerYear = feeStructure.reduce((sum, fee) => sum + fee.amount, 0)

  const paymentHistory = [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Annual Fee (FY 2024-25)',
      amount: totalFeePerYear,
      status: 'paid',
      referenceNo: 'TXN-2024-001',
    },
    {
      id: 2,
      date: '2024-02-15',
      description: 'Activity Fee - Science Exhibition',
      amount: 500,
      status: 'pending',
      referenceNo: 'TXN-2024-002',
    },
    {
      id: 3,
      date: '2023-12-20',
      description: 'Annual Fee (FY 2023-24)',
      amount: totalFeePerYear,
      status: 'paid',
      referenceNo: 'TXN-2023-001',
    },
  ]

  const pendingAmount = paymentHistory
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)

  const paidAmount = paymentHistory
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="fees" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Fees & Payment</h1>

          {/* Fee Summary */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Total Annual Fee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(totalFeePerYear)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(paidAmount)}
                </p>
              </CardContent>
            </Card>

            <Card className={`border-2 ${pendingAmount > 0 ? 'border-red-500/20' : 'border-green-500/20'}`}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className={`w-4 h-4 ${pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`} />
                  {pendingAmount > 0 ? 'Pending' : 'All Clear'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${pendingAmount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {formatCurrency(pendingAmount)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fee Structure */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Fee Structure - FY 2024-25</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feeStructure.map((fee, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{fee.category}</p>
                      <p className="text-xs text-muted-foreground">{fee.frequency}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">{formatCurrency(fee.amount)}</p>
                  </div>
                ))}
                <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">Total Annual Fee</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalFeePerYear)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{payment.description}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(payment.date)} • Ref: {payment.referenceNo}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-primary">{formatCurrency(payment.amount)}</p>
                        <Badge
                          className={
                            payment.status === 'paid'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-yellow-600 hover:bg-yellow-700'
                          }
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
