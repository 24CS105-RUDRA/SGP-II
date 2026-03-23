'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { StudentSidebar } from '@/components/layout/student-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, Pin, AlertCircle } from 'lucide-react'
import { getPublishedNotices } from '@/lib/actions/notices'
import type { Notice } from '@/types'

interface User {
  id: string
  username: string
  full_name: string
  email: string
  role: string
}

export default function StudentNoticeBoardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [notices, setNotices] = useState<Notice[]>([])

  const fetchNotices = async () => {
    try {
      const result = await getPublishedNotices()
      if (result.success) {
        setNotices(result.data || [])
      } else {
        console.error('Error fetching notices:', result.error)
      }
    } catch (error) {
      console.error('Fetch notices error:', error)
    }
  }

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'student') {
      router.push('/login')
      return
    }

    const userData = JSON.parse(session) as User
    setUser(userData)
    setLoading(false)
    fetchNotices()
  }, [router])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'event':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'urgent':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const urgentNotices = notices.filter((n) => n.priority === 'high' || n.notice_type === 'urgent')
  const otherNotices = notices.filter((n) => n.priority !== 'high' && n.notice_type !== 'urgent')

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar activeSection="notice-board" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">Notice Board</h1>

          {urgentNotices.length > 0 && (
            <Card className="mb-8 border-2 border-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Urgent Notices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {urgentNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 border-l-4 border-red-500 rounded-lg bg-red-50 dark:bg-red-950/20"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-bold text-red-700 dark:text-red-400">{notice.title}</h3>
                      {notice.priority === 'high' && (
                        <Badge className="bg-red-600 text-white">High Priority</Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground mb-3">{notice.content}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={getTypeColor(notice.notice_type)}>{notice.notice_type}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(notice.published_date || notice.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                All Announcements ({notices.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notices.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notices available at the moment.</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 border border-border rounded-lg hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-base font-semibold text-foreground flex-1">{notice.title}</h3>
                      {notice.priority === 'high' && (
                        <Badge className="bg-red-600 text-white flex-shrink-0">Important</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{notice.content}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={getTypeColor(notice.notice_type)}>{notice.notice_type}</Badge>
                      <Badge className={getPriorityColor(notice.priority)}>{notice.priority}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(notice.published_date || notice.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
