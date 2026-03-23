'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/layout/student-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

export default function TimetablePage() {
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

  const timeSlots = ['1', '2', '3', '4', '5', '6', '7', '8']
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  const timetableGrid: Record<string, Record<string, string>> = {
    'Monday': { '1': 'Mathematics', '2': 'Physics', '3': 'Chemistry', '4': 'English', '5': '-', '6': '-', '7': '-', '8': '-' },
    'Tuesday': { '1': 'English', '2': 'History', '3': 'Computer Science', '4': 'Mathematics', '5': '-', '6': '-', '7': '-', '8': '-' },
    'Wednesday': { '1': 'Physics', '2': 'Chemistry', '3': 'Biology', '4': 'History', '5': '-', '6': '-', '7': '-', '8': '-' },
    'Thursday': { '1': 'Mathematics', '2': 'Computer Science', '3': 'English', '4': 'Physics', '5': '-', '6': '-', '7': '-', '8': '-' },
    'Friday': { '1': 'Chemistry', '2': 'Biology', '3': 'History', '4': 'Mathematics', '5': '-', '6': '-', '7': '-', '8': '-' },
    'Saturday': { '1': 'Biology', '2': 'Mathematics', '3': 'Physics', '4': 'Chemistry', '5': '-', '6': '-', '7': '-', '8': '-' },
  }

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Mathematics': 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
      'Physics': 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
      'Chemistry': 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300',
      'English': 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
      'History': 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300',
      'Computer Science': 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
      'Biology': 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300',
      '-': 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400',
    }
    return colors[subject] || 'bg-gray-50 dark:bg-gray-900'
  }

  const examSchedule = [
    { date: '2024-03-15', subject: 'Mathematics', time: '9:00 AM - 12:00 PM', room: 'Exam Hall A' },
    { date: '2024-03-18', subject: 'Physics', time: '9:00 AM - 12:00 PM', room: 'Exam Hall B' },
    { date: '2024-03-21', subject: 'Chemistry', time: '9:00 AM - 12:00 PM', room: 'Exam Hall A' },
    { date: '2024-03-24', subject: 'English', time: '9:00 AM - 12:00 PM', room: 'Exam Hall C' },
    { date: '2024-03-27', subject: 'Computer Science', time: '9:00 AM - 12:00 PM', room: 'Lab A' },
  ]

  const timetable = daysOfWeek.map(day => ({
    day,
    classes: timeSlots.map(slot => ({
      time: slot,
      subject: timetableGrid[day][slot],
      teacher: 'Teacher Name', // Placeholder for teacher name
      room: 'Room Number' // Placeholder for room number
    }))
  }))

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="timetable" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Time Table & Schedule</h1>

          {/* Timetable Grid */}
          <Card className="mb-8 overflow-x-auto">
            <CardHeader>
              <CardTitle>Weekly Timetable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="inline-block min-w-full">
                {/* Header Row with Days */}
                <div className="grid gap-0" style={{ gridTemplateColumns: '80px repeat(6, 1fr)' }}>
                  {/* Corner cell */}
                  <div className="border border-border bg-primary/10 p-3 font-bold text-sm flex items-center justify-center h-16">
                    Time
                  </div>
                  
                  {/* Day headers */}
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="border border-border bg-primary/10 p-3 font-bold text-sm flex items-center justify-center h-16"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Time slots and subjects */}
                  {timeSlots.map((slot) => (
                    <div key={`slot-${slot}`}>
                      <div className="border border-border bg-gray-50 dark:bg-gray-900 p-3 font-semibold text-sm flex items-center justify-center min-h-20">
                        {slot}
                      </div>
                      {daysOfWeek.map((day) => {
                        const subject = timetableGrid[day][slot]
                        return (
                          <div
                            key={`${day}-${slot}`}
                            className={`border border-border p-3 flex items-center justify-center font-semibold text-sm min-h-20 text-center ${getSubjectColor(subject)}`}
                          >
                            {subject}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exam Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Examination Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {examSchedule.map((exam, index) => (
                  <div
                    key={index}
                    className="p-4 border-l-4 border-accent rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-foreground text-lg mb-1">{exam.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(exam.date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col md:text-right gap-2">
                        <Badge variant="outline">{exam.time}</Badge>
                        <Badge className="bg-primary text-primary-foreground">{exam.room}</Badge>
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
