'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Download } from 'lucide-react'

interface FeeStructure {
  id: string
  class: string
  tuitionFee: number
  developmentFee: number
  transportFee: number
  totalFee: number
}

interface StudentFee {
  id: string
  name: string
  rollNumber: string
  class: string
  totalFee: number
  paid: number
  pending: number
  status: 'paid' | 'pending' | 'overdue'
}

export default function FeesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([
    { id: '1', class: '10', tuitionFee: 50000, developmentFee: 10000, transportFee: 5000, totalFee: 65000 },
    { id: '2', class: '9', tuitionFee: 45000, developmentFee: 10000, transportFee: 5000, totalFee: 60000 },
  ])

  const [studentFees, setStudentFees] = useState<StudentFee[]>([
    { id: '1', name: 'Raj Kumar', rollNumber: '10A-001', class: '10', totalFee: 65000, paid: 65000, pending: 0, status: 'paid' },
    { id: '2', name: 'Priya Singh', rollNumber: '10B-002', class: '10', totalFee: 65000, paid: 32500, pending: 32500, status: 'pending' },
  ])

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'admin') {
      router.push('/login')
      return
    }

    setUser(JSON.parse(session))
    setLoading(false)
  }, [router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeSection="fees" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Fees Management</h1>

          {/* Fee Structure */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Fee Structure</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {feeStructures.map((structure) => (
                <Card key={structure.id} className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle>Class {structure.class}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Tuition Fee</span>
                      <span className="font-semibold">₹{structure.tuitionFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Development Fee</span>
                      <span className="font-semibold">₹{structure.developmentFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport Fee</span>
                      <span className="font-semibold">₹{structure.transportFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between">
                      <span className="font-bold">Total Fee</span>
                      <span className="font-bold text-primary">₹{structure.totalFee.toLocaleString()}</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4 bg-transparent">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Structure
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Student Fee Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Student Fee Status</CardTitle>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Generate Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Roll No</th>
                      <th className="text-left py-3 px-4 font-semibold">Total Fee</th>
                      <th className="text-left py-3 px-4 font-semibold">Paid</th>
                      <th className="text-left py-3 px-4 font-semibold">Pending</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentFees.map((student) => (
                      <tr key={student.id} className="border-b border-border hover:bg-accent/5">
                        <td className="py-3 px-4">{student.name}</td>
                        <td className="py-3 px-4">{student.rollNumber}</td>
                        <td className="py-3 px-4">₹{student.totalFee.toLocaleString()}</td>
                        <td className="py-3 px-4 text-green-600">₹{student.paid.toLocaleString()}</td>
                        <td className="py-3 px-4 text-red-600">₹{student.pending.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge className={
                            student.status === 'paid' ? 'bg-green-600' :
                            student.status === 'pending' ? 'bg-amber-600' :
                            'bg-red-600'
                          }>
                            {student.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
