'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit } from 'lucide-react'

interface Notice {
  id: string
  title: string
  content: string
  postedDate: string
  status: 'published' | 'draft'
}

export default function NoticesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: '1',
      title: 'Examination Schedule Updated',
      content: 'Final examinations will commence from March 15, 2026...',
      postedDate: '2026-01-22',
      status: 'published'
    },
    {
      id: '2',
      title: 'Library Extension Hours',
      content: 'The school library will remain open until 7:00 PM during examination season...',
      postedDate: '2026-01-20',
      status: 'published'
    },
  ])

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

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeSection="notices" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-primary mb-8">General Notices</h1>

          {/* New Notice Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Post New Notice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notice Title</Label>
                <Input id="title" placeholder="Enter notice title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Notice Content</Label>
                <Textarea id="content" placeholder="Enter notice content" rows={5} />
              </div>
              <div className="flex gap-3">
                <Button className="bg-primary hover:bg-primary/90">Post Notice</Button>
                <Button variant="outline">Save as Draft</Button>
              </div>
            </CardContent>
          </Card>

          {/* Published Notices */}
          <Card>
            <CardHeader>
              <CardTitle>Published Notices ({notices.filter(n => n.status === 'published').length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notices.map((notice) => (
                <div key={notice.id} className="p-4 border border-border rounded-lg hover:border-primary transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{notice.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notice.content.substring(0, 100)}...</p>
                      <p className="text-xs text-muted-foreground mt-2">Posted: {notice.postedDate}</p>
                    </div>
                    <Badge className="bg-green-600">Published</Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-primary" />
                    </button>
                    <button className="p-2 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
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
