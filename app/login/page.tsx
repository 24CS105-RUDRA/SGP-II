'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { loginUser } from '@/lib/actions/auth'

const BATCH_YEARS = [
  '2025-26',
  '2026-27',
  '2027-28',
  '2028-29',
  '2029-30',
]

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('admin')
  const [year, setYear] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate inputs
    if (role === 'student' && !year) {
      setError('Batch year is required for students')
      setLoading(false)
      return
    }

    if (!username || !password) {
      setError('Username and password are required')
      setLoading(false)
      return
    }

    console.log('[v0] Attempting login with:', { username, role })

    // Call Supabase authentication
    const result = await loginUser({ username, password, role })

    console.log('[v0] Login result:', result)

    if (!result.success) {
      setError(result.error || 'Login failed')
      setLoading(false)
      return
    }

    // Store session data
    const sessionData = {
      id: result.data?.id,
      username: result.data?.username,
      name: result.data?.full_name,
      role: result.data?.role,
      year: role === 'admin' ? 'admin' : year,
      email: result.data?.email,
      standard: result.data?.standard,
      division: result.data?.division,
      loginTime: new Date().toISOString(),
    }

    localStorage.setItem('userSession', JSON.stringify(sessionData))
    localStorage.setItem('userRole', result.data?.role || 'student')

    // Redirect based on role
    setTimeout(() => {
      if (result.data?.role === 'student') {
        router.push('/student/dashboard')
      } else if (result.data?.role === 'faculty') {
        router.push('/faculty/dashboard')
      } else if (result.data?.role === 'admin') {
        router.push('/admin/dashboard')
      }
    }, 500)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-background flex items-center justify-center p-4">
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4">
        <Button 
          onClick={() => router.push('/')} 
          variant="outline"
          className="gap-2"
        >
          ← Back to Home
        </Button>
      </div>
      
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary">Shree Sardar Patel Vidhya Sankul</h1>
          <p className="text-muted-foreground mt-2">School Management Portal</p>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>Enter your credentials to access the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="flex items-gap gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* User Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground font-semibold">
                  Login As
                </Label>
                <Select value={role} onValueChange={(v) => { setRole(v as 'student' | 'faculty' | 'admin'); setYear('') }}>
                  <SelectTrigger id="role" className="bg-background border-border">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty/Staff</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Batch Year - For Students */}
              {role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="batch" className="text-foreground font-semibold">
                    Batch Year
                  </Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger id="batch" className="bg-background border-border">
                      <SelectValue placeholder="Select batch year" />
                    </SelectTrigger>
                    <SelectContent>
                      {BATCH_YEARS.map((batchYear) => (
                        <SelectItem key={batchYear} value={batchYear}>
                          {batchYear}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

{/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-semibold">
                {role === 'admin' ? 'Username' : 'Mobile Number'}
              </Label>
              <Input
                id="username"
                type={role === 'admin' ? 'text' : 'tel'}
                placeholder={role === 'admin' ? 'Enter your username' : 'Enter 10-digit mobile number'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background border-border"
                disabled={loading}
              />
              {role !== 'admin' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Use your registered mobile number as username
                </p>
              )}
            </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2024 School Management System. All rights reserved.
        </p>
      </div>
    </main>
  )
}
