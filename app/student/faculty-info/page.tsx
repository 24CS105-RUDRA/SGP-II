'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/layout/student-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone } from 'lucide-react'
import { getClassFaculty } from '@/lib/actions/class-faculty'

interface ClassFacultyAssignment {
  id: string
  faculty_name: string
  phone_number: string
  subject: string
}

interface UserSession {
  username: string
  name: string
  standard?: string
  division?: string
}

export default function StudentFacultyInfo() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [faculty, setFaculty] = useState<ClassFacultyAssignment[]>([])

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'student') {
      router.push('/login')
      return
    }

    const userData = JSON.parse(session)
    setUser(userData)
    console.log('[v0] Student user loaded:', userData.username)
    console.log('[v0] Student class:', userData.standard, userData.division)

    // Get standard from userData - it should be returned from login
    const standard = userData.standard
    const division = userData.division

    if (standard && division) {
      fetchFaculty(standard, division)
    } else {
      console.error('[v0] Student class information missing')
      console.error('[v0] Available userData:', userData)
      setLoading(false)
    }
  }, [router])

  const fetchFaculty = async (standard: string, division: string) => {
    console.log('[v0] Fetching faculty for class:', standard, division)
    const result = await getClassFaculty(standard, division)
    console.log('[v0] Faculty fetch result:', result)

    if (result.success && result.data) {
      console.log('[v0] Faculty count:', result.data.length)
      setFaculty(result.data)
    } else {
      console.error('[v0] Error fetching faculty:', result.error)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="faculty-info" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Faculty Information</h1>
            <p className="text-muted-foreground">
              Your class: {user.standard}-{user.division}
            </p>
          </div>

          {/* Faculty Cards Grid */}
          {faculty.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculty.map(fac => (
                <Card
                  key={fac.id}
                  className="hover:shadow-lg transition-shadow border-l-4 border-l-primary"
                >
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">
                      {fac.faculty_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Subject: <span className="font-semibold text-foreground">{fac.subject}</span>
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <a
                            href={`tel:${fac.phone_number}`}
                            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {fac.phone_number}
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No faculty information available for your class yet.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please contact the administration to get faculty details.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
