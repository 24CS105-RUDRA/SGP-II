'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FacultySidebar } from '@/components/layout/faculty-sidebar'
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

    if (!session || role !== 'faculty') {
      router.push('/login')
      return
    }

    setUser(JSON.parse(session))
    setLoading(false)
  }, [router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  const timetable = [
    { day: 'Monday', time: '9:00 - 10:00 AM', class: 'Class 10A', room: '101' },
    { day: 'Monday', time: '10:15 - 11:15 AM', class: 'Class 10B', room: '102' },
    { day: 'Tuesday', time: '9:00 - 10:00 AM', class: 'Class 10B', room: '102' },
    { day: 'Tuesday', time: '11:00 - 12:00 PM', class: 'Class 9A', room: '201' },
    { day: 'Wednesday', time: '9:00 - 10:00 AM', class: 'Class 10A', room: '101' },
    { day: 'Thursday', time: '2:00 - 3:00 PM', class: 'Class 10B', room: '102' },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar activeSection="timetable" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8 ml-5 md:ml-0">Manage Timetable</h1>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Your Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timetable.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Day</p>
                        <p className="font-bold text-foreground">{item.day}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-bold text-foreground">{item.time}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Class</p>
                        <Badge className="bg-primary text-primary-foreground">{item.class}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Room</p>
                        <p className="font-bold text-foreground">{item.room}</p>
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
