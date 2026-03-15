'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, RotateCcw } from 'lucide-react'

interface User {
  id: string
  name: string
  type: 'student' | 'faculty'
  username: string
  email: string
  lastChanged: string
}

export default function PasswordManagementPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [selectedType, setSelectedType] = useState<'student' | 'faculty'>('student')

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

  const filteredUsers = users.filter(u => u.type === selectedType)

  const handleResetPassword = (userId: string) => {
    alert('Password reset link has been sent to the user.')
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeSection="password-management" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Password Management</h1>

          {/* Bulk Password Reset */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Reset Passwords</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Set temporary passwords for users. They will be prompted to change it on first login.
              </p>
              <div className="space-y-2">
                <Label htmlFor="bulk-reset">Select User Type to Reset</Label>
                <div className="flex gap-3">
                  <Button 
                    variant={selectedType === 'student' ? 'default' : 'outline'}
                    onClick={() => setSelectedType('student')}
                  >
                    All Students
                  </Button>
                  <Button 
                    variant={selectedType === 'faculty' ? 'default' : 'outline'}
                    onClick={() => setSelectedType('faculty')}
                  >
                    All Faculty
                  </Button>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">Send Reset Links</Button>
            </CardContent>
          </Card>

          {/* User Password Status */}
          <Card>
            <CardHeader>
              <CardTitle>
                Password Status - {selectedType === 'student' ? 'Students' : 'Faculty'} ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Username</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Last Changed</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border hover:bg-accent/5">
                        <td className="py-3 px-4">{u.name}</td>
                        <td className="py-3 px-4 font-mono text-sm">{u.username}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-4 text-sm">{u.lastChanged}</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => handleResetPassword(u.id)}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <RotateCcw className="w-4 h-4 text-primary" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Password Policy */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="text-sm font-semibold mb-2">Current Policy Requirements:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Minimum 8 characters</li>
                  <li>• Must contain uppercase and lowercase letters</li>
                  <li>• Must contain at least one number</li>
                  <li>• Must contain at least one special character</li>
                  <li>• Password expires every 90 days</li>
                </ul>
              </div>
              <Button variant="outline">Edit Password Policy</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
