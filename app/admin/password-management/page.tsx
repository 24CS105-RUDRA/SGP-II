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
import {
  getPasswordManagedUsers,
  resetSingleUserPassword,
  resetPasswordsByRole,
} from '@/lib/actions/password-management'

interface User {
  id: string
  name: string
  role: 'student' | 'faculty'
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
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'admin') {
      router.push('/login')
      return
    }

    setUser(JSON.parse(session))
    fetchUsers('student')
  }, [router])

  const fetchUsers = async (type: 'student' | 'faculty') => {
    setLoading(true)
    const result = await getPasswordManagedUsers(type)
    if (result.success) {
      setUsers(result.data || [])
    } else {
      alert(`Error: ${result.error}`)
    }
    setLoading(false)
  }

  const handleSelectType = async (type: 'student' | 'faculty') => {
    setSelectedType(type)
    await fetchUsers(type)
  }

  if (loading) return <div>Loading...</div>
  if (!user) return null

  const filteredUsers = users.filter(
    (u) => u.role === selectedType && u.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleResetPassword = async (userId: string) => {
    if (!newPassword.trim()) {
      alert('Please enter a temporary password')
      return
    }

    setActiveUserId(userId)
    const result = await resetSingleUserPassword(userId, newPassword)
    setActiveUserId(null)

    if (result.success) {
      alert('Password reset successfully')
      await fetchUsers(selectedType)
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleBulkReset = async () => {
    if (!newPassword.trim()) {
      alert('Please enter a temporary password')
      return
    }

    if (!confirm(`Reset password for all ${selectedType}s?`)) return

    setBusy(true)
    const result = await resetPasswordsByRole(selectedType, newPassword)
    setBusy(false)

    if (result.success) {
      alert(`Password reset successfully for ${result.updatedCount || 0} ${selectedType}(s)`)
      await fetchUsers(selectedType)
    } else {
      alert(`Error: ${result.error}`)
    }
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
                Search users by name and set passwords directly for selected users or all users of one role.
              </p>
              <div className="space-y-2">
                <Label htmlFor="bulk-reset">Select User Type to Reset</Label>
                <div className="flex gap-3">
                  <Button 
                    variant={selectedType === 'student' ? 'default' : 'outline'}
                    onClick={() => handleSelectType('student')}
                    disabled={loading || busy}
                  >
                    All Students
                  </Button>
                  <Button 
                    variant={selectedType === 'faculty' ? 'default' : 'outline'}
                    onClick={() => handleSelectType('faculty')}
                    disabled={loading || busy}
                  >
                    All Faculty
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Temporary Password</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter temporary password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={handleBulkReset}
                    disabled={busy || loading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {busy ? 'Resetting...' : 'Reset All'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Admin-created passwords are set directly without password policy enforcement.
                </p>
              </div>
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
              <div className="mb-4">
                <Label htmlFor="search-name" className="text-sm">Search by Name</Label>
                <Input
                  id="search-name"
                  placeholder="Type student/faculty name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
              </div>
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
                            disabled={activeUserId === u.id || busy || loading}
                            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                            title="Reset Password"
                          >
                            <RotateCcw className="w-4 h-4 text-primary" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted-foreground">
                          No users found for this search.
                        </td>
                      </tr>
                    )}
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
