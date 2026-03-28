'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/layout/student-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, TrendingUp } from 'lucide-react'
import { getStudentFee } from '@/lib/actions/fees'

interface Installment {
  installment_number: number
  amount: number
  due_date: string
}

export default function FeesDetailsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [feeData, setFeeData] = useState<any>(null)

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'student') {
      router.push('/login')
      return
    }

    const userData = JSON.parse(session)
    setUser(userData)
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (user?.id) {
      loadStudentFee()
    }
  }, [user])

  const loadStudentFee = async () => {
    const result = await getStudentFee(user.id)
    if (result.success && result.data) {
      setFeeData(result.data)
    } else {
      setFeeData(null)
    }
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
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

  if (loading) return <div>Loading...</div>
  if (!user) return null

  const installments: Installment[] = feeData?.installments || []
  const totalAmount = feeData?.total_amount || 0

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="fees" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">My Fees</h1>

          {!feeData ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No fee structure has been created for Class {user.standard}. 
                Please contact your school administrator.
              </p>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Fee Details - Class {user.standard}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">Total Annual Fee</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Installments</h3>
                  <div className="space-y-3">
                    {installments.map((inst) => (
                      <div
                        key={inst.installment_number}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                            {inst.installment_number}
                          </div>
                          <div>
                            <p className="font-semibold">Installment {inst.installment_number}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {formatDate(inst.due_date)}
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(inst.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
