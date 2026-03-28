'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FacultySidebar } from '@/components/layout/faculty-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Save } from 'lucide-react'
import { getStudentsForAttendance, markBulkAttendance, getAssignedStudentsForAttendance } from '@/lib/actions/attendance'
import { getFacultyByUserId } from '@/lib/actions/faculty'

interface Student {
  id: string
  student_id?: string
  student_name?: string
  roll_number?: string
  standard?: string
  division?: string
  class?: string
  user?: {
    full_name: string
    username: string
  }
}

interface User {
  id: string
  username: string
  full_name: string
}

export default function AttendancePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<{ [key: string]: 'present' | 'absent' | 'missing' }>({})
  const [submitting, setSubmitting] = useState(false)
  const [assignedStandard, setAssignedStandard] = useState<string | null>(null)
  const [assignedDivision, setAssignedDivision] = useState<string | null>(null)
  const [facultyId, setFacultyId] = useState<string | null>(null)

  const standards = ['9', '10', '11', '12']
  const divisions = ['A', 'B', 'C', 'D']

  const today = new Date().toISOString().split('T')[0]
  const isFutureDate = selectedDate > today

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

  const fetchStudents = async (standard: string, division: string) => {
    // Fetch students using faculty assignments (includes student names)
    if (facultyId) {
      const result = await getAssignedStudentsForAttendance(facultyId)
      if (result.success) {
        console.log('[v0] Assigned students fetched:', result.data)
        setStudents(result.data || [])
        setAttendance({})
      } else {
        console.error('[v0] Error fetching assigned students:', result.error)
      }
    }
  }

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'faculty') {
      router.push('/login')
      return
    }

    const userData = JSON.parse(session) as User
    setUser(userData)

    // Fetch faculty profile to get assigned class
    const fetchFacultyProfile = async () => {
      try {
        const result = await fetchFacultyProfileWithRetry(userData.id)
        if (result.success && result.data) {
          console.log('[v0] Faculty profile:', result.data)
          setFacultyId(result.data.id)
          setAssignedStandard(result.data.assigned_standard || null)
          setAssignedDivision(result.data.assigned_division || null)
          if (result.data.assigned_standard && result.data.assigned_division) {
            setSelectedStandard(result.data.assigned_standard)
            setSelectedDivision(result.data.assigned_division)
            // Fetch assigned students
            const assignedResult = await getAssignedStudentsForAttendance(result.data.id)
            if (assignedResult.success) {
              setStudents(assignedResult.data || [])
            }
          }
        } else {
          console.error('[v0] Error fetching faculty profile:', result.error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchFacultyProfile()
  }, [router])

  const handleClassChange = async (standard: string, division: string) => {
    setSelectedStandard(standard)
    setSelectedDivision(division)
    await fetchStudents(standard, division)
  }

  const handleAttendanceToggle = (studentId: string) => {
    setAttendance((prev) => {
      const current = prev[studentId] || 'absent'
      const next = current === 'absent' ? 'present' : 'absent'
      return { ...prev, [studentId]: next }
    })
  }

  const getAttendanceKey = (student: Student) => student.student_id || student.id

  const handleMarkAll = () => {
    const allPresent = students.every((s) => attendance[getAttendanceKey(s)] === 'present')
    const newAttendance: typeof attendance = {}
    students.forEach((s) => {
      newAttendance[getAttendanceKey(s)] = allPresent ? 'absent' : 'present'
    })
    setAttendance(newAttendance)
  }

  const presentCount = Object.values(attendance).filter((v) => v === 'present').length
  const absentCount = Object.values(attendance).filter((v) => v === 'absent').length

  const handleSave = async () => {
    if (!user || !facultyId) return
    if (students.length === 0) {
      alert('No students found')
      return
    }

    if (isFutureDate) {
      alert('Cannot mark attendance for future dates')
      return
    }

    setSubmitting(true)

    try {
      const records = students.map((student) => ({
        student_id: getAttendanceKey(student),
        faculty_id: facultyId,
        attendance_date: selectedDate,
        status: (attendance[getAttendanceKey(student)] || 'missing') as 'present' | 'absent' | 'missing',
        subject: 'General',
        standard: selectedStandard!,
        division: selectedDivision!,
      }))

      const result = await markBulkAttendance(records)

      if (result.success) {
        console.log('[v0] Attendance marked')
        alert(`Attendance marked for ${presentCount} present, ${absentCount} absent on ${selectedDate}`)
      } else {
        alert(`Error: ${result.error}`)
        console.error('[v0] Mark attendance error:', result.error)
      }
    } catch (error) {
      console.error('[v0] Save error:', error)
      alert('Failed to save attendance')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar activeSection="attendance" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Mark Attendance</h1>

          {/* Date & Class Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Date & View Class</CardTitle>
              {assignedStandard && assignedDivision && (
                <p className="text-sm text-muted-foreground mt-2">Assigned Class: <span className="font-bold text-primary">{assignedStandard}-{assignedDivision}</span></p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Date</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={today}
                  className="flex-1 p-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              {isFutureDate && (
                <p className="text-sm text-red-500 mt-1">Cannot mark attendance for future dates</p>
              )}
            </div>
                {assignedStandard && assignedDivision ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Standard</label>
                      <input
                        type="text"
                        value={assignedStandard}
                        disabled
                        className="w-full p-2 rounded-lg border border-border bg-gray-100 dark:bg-gray-800 text-foreground cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Division</label>
                      <input
                        type="text"
                        value={assignedDivision}
                        disabled
                        className="w-full p-2 rounded-lg border border-border bg-gray-100 dark:bg-gray-800 text-foreground cursor-not-allowed"
                      />
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2 p-3 bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 rounded-lg">
                    No class assigned. Please contact administrator.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Attendance</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Present: {presentCount} | Absent: {absentCount} / {students.length}
                  </p>
                </div>
                <Button
                  onClick={handleMarkAll}
                  variant="outline"
                  className="bg-primary/10 hover:bg-primary/20 text-primary"
                >
                  {students.every((s) => attendance[getAttendanceKey(s)] === 'present')
                    ? 'Clear All'
                    : 'Mark All Present'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {students.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No students found in this class</p>
              ) : (
                students.map((student) => (
                  <div
                    key={getAttendanceKey(student)}
                    onClick={() => handleAttendanceToggle(getAttendanceKey(student))}
                    className="p-4 border border-border rounded-lg hover:border-primary cursor-pointer transition-colors flex items-center justify-between hover:bg-accent/10"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Checkbox
                        checked={attendance[getAttendanceKey(student)] === 'present'}
                        onChange={() => {}}
                        className="cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{student.student_name || student.user?.full_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{student.class || student.standard} - {student.division}</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        attendance[getAttendanceKey(student)] === 'present'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }
                    >
                      {attendance[getAttendanceKey(student)] === 'present' ? 'Present' : 'Absent'}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="mt-8 flex gap-3">
        <Button
          onClick={handleSave}
          disabled={submitting || students.length === 0 || isFutureDate}
          className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {submitting ? 'Saving...' : 'Save Attendance'}
        </Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
