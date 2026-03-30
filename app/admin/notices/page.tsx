'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Edit, X } from 'lucide-react'
import { createNotice, deleteNotice, getAllNotices, updateNotice } from '@/lib/actions/notices'
import type { Notice } from '@/types'

interface User {
  id: string
  username: string
  full_name: string
  email: string
  role: string
}

export default function AdminNoticesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [notices, setNotices] = useState<Notice[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    notice_type: 'general' as 'general' | 'academic' | 'event' | 'urgent',
    priority: 'medium' as 'low' | 'medium' | 'high',
  })

  const fetchNotices = async (userId: string) => {
    try {
      const result = await getAllNotices(userId)
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

    if (!session || role !== 'admin') {
      router.push('/login')
      return
    }

    const userData = JSON.parse(session) as User
    setUser(userData)
    setLoading(false)
    fetchNotices(userData.id)
  }, [router])

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      notice_type: 'general',
      priority: 'medium',
    })
    setEditingNotice(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)

    try {
      if (editingNotice) {
        const result = await updateNotice(editingNotice.id, {
          title: formData.title,
          content: formData.content,
          notice_type: formData.notice_type,
          priority: formData.priority,
        })

        if (result.success) {
          resetForm()
          await fetchNotices(user.id)
        } else {
          alert(`Error updating notice: ${result.error}`)
        }
      } else {
        const result = await createNotice({
          created_by: user.id,
          title: formData.title,
          content: formData.content,
          notice_type: formData.notice_type,
          priority: formData.priority,
        })

        if (result.success) {
          resetForm()
          await fetchNotices(user.id)
        } else {
          alert(`Error creating notice: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Failed to save notice')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice)
    setFormData({
      title: notice.title,
      content: notice.content,
      notice_type: notice.notice_type,
      priority: notice.priority,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return

    try {
      const result = await deleteNotice(id)
      if (result.success && user) {
        await fetchNotices(user.id)
      } else {
        alert(`Error deleting notice: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete notice')
    }
  }

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

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeSection="notices" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 pl-16 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary">Notice Management</h1>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? 'Cancel' : 'New Notice'}
            </Button>
          </div>

          {showForm && (
            <Card className="mb-8 border-2 border-primary">
              <CardHeader>
                <CardTitle>{editingNotice ? 'Edit Notice' : 'Create New Notice'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter notice title"
                      className="mt-2"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write notice content here..."
                      className="mt-2 h-32"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Notice Type</Label>
                      <Select
                        value={formData.notice_type}
                        onValueChange={(value: any) => setFormData({ ...formData, notice_type: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
                      {submitting ? 'Saving...' : editingNotice ? 'Update Notice' : 'Publish Notice'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Notices ({notices.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notices.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No notices yet. Create one to get started!</p>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground mb-1">{notice.title}</h3>
                        <p className="text-sm text-muted-foreground">{notice.content}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
                          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getTypeColor(notice.notice_type)}>{notice.notice_type}</Badge>
                      <Badge className={getPriorityColor(notice.priority)}>{notice.priority}</Badge>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                        Published
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notice.published_date || notice.created_at).toLocaleDateString('en-IN')}
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
