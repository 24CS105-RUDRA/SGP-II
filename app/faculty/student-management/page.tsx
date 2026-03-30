'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FacultySidebar } from '@/components/layout/faculty-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Loading from './loading'
import { getStudentsForFaculty, autoAssignStudentsToFaculty } from '@/lib/actions/faculty-assignments'
import { getFacultyByUserId } from '@/lib/actions/faculty'

interface StudentAssignment {
  id: string
  student_id: string
  faculty_id: string
  student_name: string
  faculty_name: string
  class: string
  division: string
  assigned_at: string
}

export default function StudentManagementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [facultyId, setFacultyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<StudentAssignment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [autoAssigning, setAutoAssigning] = useState(false)
  const [message, setMessage] = useState<string>('')

  const fetchFacultyProfileWithRetry = async (userId: string, retries = 1) => {
    let lastResult: Awaited<ReturnType<typeof getFacultyByUserId>> | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      const result = await getFacultyByUserId(userId)
      lastResult = result

      const isFetchFailure = typeof result.error === 'string' && result.error.toLowerCase().includes('fetch failed')
      if (!isFetchFailure || attempt === retries) {
        return result
      }

      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    return lastResult || { success: false, error: 'Failed to fetch faculty profile' }
  }

  useEffect(() => {
    const initPage = async () => {
      const session = localStorage.getItem('userSession')
      const role = localStorage.getItem('userRole')

      if (!session || role !== 'faculty') {
        router.push('/login')
        return
      }

      const userData = JSON.parse(session)
      setUser(userData)

      // Fetch faculty profile to get faculty ID
      const result = await fetchFacultyProfileWithRetry(userData.id)
      if (result.success && result.data) {
        setFacultyId(result.data.id)
        // Fetch assigned students
        const studentsResult = await getStudentsForFaculty(result.data.id)
        if (studentsResult.success) {
          setStudents(studentsResult.data || [])
        }
      }

      setLoading(false)
    }

    initPage()
  }, [router])

  const handleAutoAssign = async () => {
    setAutoAssigning(true)
    setMessage('')

    const result = await autoAssignStudentsToFaculty()

    if (result.success) {
      setMessage(`✓ ${result.message}`)
      // Refresh students list
      if (facultyId) {
        const studentsResult = await getStudentsForFaculty(facultyId)
        if (studentsResult.success) {
          setStudents(studentsResult.data || [])
        }
      }
    } else {
      setMessage(`✗ ${result.error}`)
    }

    setAutoAssigning(false)
  }

  const filteredStudents = students.filter(
    (s) =>
      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loading />
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar activeSection="student-management" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 pl-16 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Manage Students</h1>
            <Button onClick={handleAutoAssign} disabled={autoAssigning} className="gap-2">
              {autoAssigning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Auto-Assign Students'
              )}
            </Button>
          </div>

          {/* Message */}
          {message && (
            <Card className={`mb-4 border-l-4 ${message.includes('✓') ? 'border-l-green-500 bg-green-50 dark:bg-green-950' : 'border-l-red-500 bg-red-50 dark:bg-red-950'}`}>
              <CardContent className="pt-4">
                <p className={message.includes('✓') ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                  {message}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Students ({filteredStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No students assigned yet. Click "Auto-Assign Students" to assign students based on your class and division.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Student Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Student ID</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">
                          Class
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground">Division</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Assigned Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-background/50 transition-colors"
                        >
                          <td className="py-4 px-4 text-foreground font-medium">{student.student_name}</td>
                          <td className="py-4 px-4 text-muted-foreground text-sm">{student.student_id}</td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant="outline">{student.class}</Badge>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant="secondary">{student.division}</Badge>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">
                            {new Date(student.assigned_at).toLocaleDateString()}
                          </td>
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
    </div>
  )
}
