'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FacultySidebar } from '@/components/FacultySidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import { createNotice, deleteNotice, getAllNotices } from '@/lib/actions/notices'

interface Notice {
  id: string
  title: string
  content: string
  created_by: string
  notice_type: 'general' | 'academic' | 'event' | 'emergency'
  priority: 'low' | 'normal' | 'high'
  is_published: boolean
  published_date: string
  created_at: string
}

interface User {
  id: string
  username: string
  full_name: string
  email: string
  role: string
}

export default function NoticesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [notices, setNotices] = useState<Notice[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  // Fetch notices from server
  const fetchNotices = async (userId: string) => {
    try {
      const result = await getAllNotices(userId)

      if (result.success) {
        console.log('[v0] Notices fetched:', result.data)
        setNotices(result.data || [])
      } else {
        console.error('[v0] Error fetching notices:', result.error)
      }
    } catch (error) {
      console.error('[v0] Fetch notices error:', error)
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
    setLoading(false)
    fetchNotices(userData.id)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)

    try {
      const result = await createNotice({
        created_by: user.id,
        title: formData.title,
        content: formData.content,
        notice_type: 'general',
        priority: 'normal',
      })

      if (result.success) {
        console.log('[v0] Notice created successfully:', result.data)
        setFormData({ title: '', content: '' })
        setShowForm(false)
        await fetchNotices(user.id)
      } else {
        alert(`Error creating notice: ${result.error}`)
        console.error('[v0] Create notice error:', result.error)
      }
    } catch (error) {
      console.error('[v0] Submit error:', error)
      alert('Failed to create notice')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) {
      return
    }

    try {
      const result = await deleteNotice(id)

      if (result.success) {
        console.log('[v0] Notice deleted successfully')
        await fetchNotices(user.id)
      } else {
        alert(`Error deleting notice: ${result.error}`)
        console.error('[v0] Delete notice error:', result.error)
      }
    } catch (error) {
      console.error('[v0] Delete error:', error)
      alert('Failed to delete notice')
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <FacultySidebar activeSection="notices" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary">Post Notices</h1>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Notice
            </Button>
          </div>

          {/* New Notice Form */}
          {showForm && (
            <Card className="mb-8 border-2 border-accent">
              <CardHeader>
                <CardTitle>Create New Notice</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="title" className="text-foreground font-semibold">
                      Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter notice title"
                      className="mt-2 bg-background border-border"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-foreground font-semibold">
                      Content
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Write your notice content here..."
                      className="mt-2 bg-background border-border h-32"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="submit"
                      disabled={submitting}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {submitting ? 'Publishing...' : 'Publish'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setFormData({ title: '', content: '' })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Published Notices */}
          <Card>
            <CardHeader>
              <CardTitle>Published Notices ({notices.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notices.length === 0 ? (
                <p className="text-muted-foreground">No notices yet. Create one to get started!</p>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-primary mb-1">{notice.title}</h3>
                        <p className="text-sm text-muted-foreground">{notice.content}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600 hover:bg-green-700">Published</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notice.published_date).toLocaleDateString('en-IN')}
                      </span>
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
