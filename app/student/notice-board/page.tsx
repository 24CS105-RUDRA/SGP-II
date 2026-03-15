'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/StudentSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, Pin } from 'lucide-react'

export default function NoticeBoardPage() {
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

  const notices = [
    {
      id: 1,
      title: 'Annual Examination Schedule',
      category: 'Academic',
      date: '2024-02-25',
      content: 'Final examinations will commence from March 15. Check the attached schedule for details. Class tests will be conducted from March 5-10.',
      isPinned: true,
      isUrgent: true,
    },
    {
      id: 2,
      title: 'Library Extension Hours',
      category: 'General',
      date: '2024-02-23',
      content: 'The school library will remain open until 7:00 PM during examination season to provide students with adequate preparation time.',
      isPinned: false,
      isUrgent: false,
    },
    {
      id: 3,
      title: 'Sports Day Registrations',
      category: 'Activities',
      date: '2024-02-20',
      content: 'Register for sports day events by March 1st. Limited slots available. Contact the sports coordinator for more details.',
      isPinned: false,
      isUrgent: true,
    },
    {
      id: 4,
      title: 'Parent-Teacher Conference',
      category: 'Important',
      date: '2024-02-18',
      content: 'Parents are requested to attend the parent-teacher conference on March 8th to discuss their ward\'s academic progress.',
      isPinned: false,
      isUrgent: false,
    },
    {
      id: 5,
      title: 'Science Exhibition Preparation',
      category: 'Academic',
      date: '2024-02-16',
      content: 'Science exhibition will be held on April 5th. Form groups of 3-4 students and select your project topic by March 10th.',
      isPinned: false,
      isUrgent: false,
    },
    {
      id: 6,
      title: 'Holiday Announcement',
      category: 'General',
      date: '2024-02-14',
      content: 'School will remain closed on March 8th (Women\'s Day) and March 25th (Holi). Normal classes will resume the next day.',
      isPinned: false,
      isUrgent: false,
    },
  ]

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Academic: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
      General: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      Activities: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
      Important: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300',
    }
    return colors[category] || colors.General
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const pinnedNotices = notices.filter((n) => n.isPinned)
  const otherNotices = notices.filter((n) => !n.isPinned)

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="notice-board" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Notice Board</h1>

          {/* Pinned Notices */}
          {pinnedNotices.length > 0 && (
            <Card className="mb-8 border-2 border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Pin className="w-5 h-5" />
                  Important Notices (Pinned)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pinnedNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 border-l-4 border-accent rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-accent">{notice.title}</h3>
                          {notice.isUrgent && <Badge className="bg-red-600 hover:bg-red-700">Urgent</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{notice.content}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={getCategoryColor(notice.category)}>
                            {notice.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(notice.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* All Notices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                All Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {otherNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 border border-border rounded-lg hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-base font-semibold text-foreground flex-1">{notice.title}</h3>
                    {notice.isUrgent && (
                      <Badge className="bg-red-600 hover:bg-red-700 flex-shrink-0">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{notice.content}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={getCategoryColor(notice.category)}>
                      {notice.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(notice.date)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
