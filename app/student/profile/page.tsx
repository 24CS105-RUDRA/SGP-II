'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/layout/student-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Phone, Lock } from 'lucide-react'
import { changePassword } from '@/lib/actions/auth'
import { getStudentByUserId } from '@/lib/actions/students'
import type { StudentProfile } from '@/types'

interface UserSession {
  id: string
  username: string
  name: string
  role: string
}

export default function StudentProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  const fetchStudentProfile = async (userId: string) => {
    try {
      const result = await getStudentByUserId(userId)
      if (result.success && result.data) {
        setStudent(result.data)
      }
    } catch (error) {
      console.error('Error fetching student profile:', error)
    }
  }

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'student') {
      router.push('/login')
      return
    }

    const userData = JSON.parse(session)
    setUser(userData)
    fetchStudentProfile(userData.id)
    setLoading(false)
  }, [router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match')
      return
    }

    setPasswordSubmitting(true)
    try {
      const result = await changePassword(user.id, passwordData.currentPassword, passwordData.newPassword)
      if (result.success) {
        alert('Password changed successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to change password')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  const studentUser = student?.user as { full_name?: string; email?: string; username?: string } | undefined

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="profile" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8 ml-5 md:ml-0">Student Profile</h1>

          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-foreground">{student?.student_name || studentUser?.full_name || user.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Roll Number</p>
                  <p className="text-lg font-semibold text-foreground">{student?.roll_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Class</p>
                  <Badge className="text-base">{student?.standard ? `Class ${student.standard}` : 'N/A'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Division</p>
                  <p className="text-lg font-semibold text-foreground">{student?.division || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                  <p className="text-lg font-semibold text-foreground">{student?.date_of_birth || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="font-semibold">{student?.phone_number ? `+91 ${student.phone_number}` : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Father's Mobile</p>
                  <p className="font-semibold">{student?.father_mobile ? `+91 ${student.father_mobile}` : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Mother's Mobile</p>
                  <p className="font-semibold">{student?.mother_mobile ? `+91 ${student.mother_mobile}` : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Reset */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>

                <Button type="submit" disabled={passwordSubmitting}>
                  {passwordSubmitting ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
