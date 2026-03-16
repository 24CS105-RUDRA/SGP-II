'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/StudentSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Calendar, Award } from 'lucide-react'
import { changePassword } from '@/lib/actions/auth'

interface UserSession {
  id: string
  username: string
  name: string
  role: string
  year: string
}

export default function StudentProfile() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

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

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="profile" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Student Profile</h1>

          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="text-lg font-semibold text-foreground">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Roll Number</p>
                  <p className="text-lg font-semibold text-foreground">AVS-{user.year}-{user.username.padStart(4, '0')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Year</p>
                  <Badge className="text-base">{user.year} Year</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Section</p>
                  <p className="text-lg font-semibold text-foreground">A</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                  <p className="text-lg font-semibold text-foreground">15 / 05 / 2006</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gender</p>
                  <p className="text-lg font-semibold text-foreground">Male</p>
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
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{user.username}@student.archnavidhya.edu.in</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="font-semibold">+91 {user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-semibold">123 Student Lane, City, State 12345</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Admission Year</p>
                  <p className="text-lg font-semibold">2022</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Grade / Stream</p>
                  <p className="text-lg font-semibold">Senior Secondary (Science)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Classroom Teacher</p>
                  <p className="text-lg font-semibold">Mrs. Sneha Verma</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                  <p className="text-lg font-semibold">87.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent / Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle>Parent / Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Guardian Name</p>
                  <p className="text-lg font-semibold">Mr. Rajesh Kumar</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Relation</p>
                  <p className="text-lg font-semibold">Father</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact Number</p>
                  <p className="text-lg font-semibold">+91 9876543210</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="text-lg font-semibold">rajesh@email.com</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Reset */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
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
