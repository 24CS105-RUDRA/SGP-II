'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, Edit2, Trash2, Plus } from 'lucide-react'
import { getAllFaculty, createFaculty, deleteFaculty } from '@/lib/actions/faculty'

interface FacultyProfile {
  id: string
  user_id: string
  employee_id: string
  department: string
  subject: string
  faculty_name?: string
  assigned_standard?: string
  assigned_division?: string
  phone_number?: string
  user?: {
    full_name: string
    email: string
    username: string
  }
}

export default function FacultyProfilesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [faculty, setFaculty] = useState<FacultyProfile[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    employee_id: '',
    department: 'Mathematics',
    subject: '',
    phone_number: '',
    assigned_standard: '',
    assigned_division: '',
  })

  const fetchFaculty = async () => {
    const result = await getAllFaculty()
    if (result.success) {
      console.log('[v0] Faculty fetched:', result.data)
      setFaculty(result.data || [])
    } else {
      console.error('[v0] Error fetching faculty:', result.error)
    }
  }

  useEffect(() => {
    const session = localStorage.getItem('userSession')
    const role = localStorage.getItem('userRole')

    if (!session || role !== 'admin') {
      router.push('/login')
      return
    }

    setUser(JSON.parse(session))
    setLoading(false)
    fetchFaculty()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.password || !formData.full_name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const result = await createFaculty(formData)

      if (result.success) {
        console.log('[v0] Faculty created:', result.data)
        setFormData({
          username: '',
          password: '',
          full_name: '',
          email: '',
          employee_id: '',
          department: 'Mathematics',
          subject: '',
          phone_number: '',
          assigned_standard: '',
          assigned_division: '',
        })
        setShowForm(false)
        await fetchFaculty()
        alert('Faculty added successfully! Credentials: ' + formData.username + ' / ' + formData.password)
      } else {
        alert(`Error: ${result.error}`)
        console.error('[v0] Create faculty error:', result.error)
      }
    } catch (error) {
      console.error('[v0] Submit error:', error)
      alert('Failed to create faculty')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (facultyId: string) => {
    if (!confirm('Are you sure you want to delete this faculty?')) return

    try {
      const result = await deleteFaculty(facultyId)
      if (result.success) {
        console.log('[v0] Faculty deleted')
        await fetchFaculty()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('[v0] Delete error:', error)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  const departments = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science']
  const filteredFaculty = faculty.filter(f =>
    f.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeSection="faculty-profiles" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-primary">Faculty Management</h1>
            <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Faculty
            </Button>
          </div>

          {/* Add Faculty Form */}
          {showForm && (
            <Card className="mb-8 border-2 border-accent">
              <CardHeader>
                <CardTitle>Add New Faculty</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Username *</Label>
                    <Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Password *</Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Employee ID</Label>
                    <Input value={formData.employee_id} onChange={(e) => setFormData({...formData, employee_id: e.target.value})} />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <select className="w-full border border-border rounded px-3 py-2" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                  </div>
                  <div>
                    <Label>Assign Class</Label>
                    <select className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" value={formData.assigned_standard} onChange={(e) => setFormData({...formData, assigned_standard: e.target.value, assigned_division: ''})}>
                      <option value="">Select Class</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(cls => <option key={cls} value={cls.toString()}>Class {cls}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Assign Division</Label>
                    {!formData.assigned_standard ? (
                      <select disabled className="w-full border border-border rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-foreground cursor-not-allowed" value="">
                        <option>Select Class First</option>
                      </select>
                    ) : (
                      <select className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" value={formData.assigned_division} onChange={(e) => setFormData({...formData, assigned_division: e.target.value})}>
                        <option value="">Select Division</option>
                        {parseInt(formData.assigned_standard) <= 10 ? (
                          <>
                            <option value="A">Division A</option>
                            <option value="B">Division B</option>
                            <option value="C">Division C</option>
                            <option value="D">Division D</option>
                          </>
                        ) : (
                          <>
                            <option value="Science-A">Science (A)</option>
                            <option value="Science-B">Science (B)</option>
                            <option value="Science-C">Science (C)</option>
                            <option value="Science-D">Science (D)</option>
                            <option value="Commerce-A">Commerce (A)</option>
                            <option value="Commerce-B">Commerce (B)</option>
                            <option value="Commerce-C">Commerce (C)</option>
                            <option value="Commerce-D">Commerce (D)</option>
                          </>
                        )}
                      </select>
                    )}
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <Button type="submit" disabled={submitting} className="bg-accent hover:bg-accent/90">
                      {submitting ? 'Creating...' : 'Add Faculty'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, employee ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Faculty Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Faculty ({filteredFaculty.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Employee ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Department</th>
                      <th className="text-left py-3 px-4 font-semibold">Subject</th>
                      <th className="text-left py-3 px-4 font-semibold">Class/Div</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaculty.map((member) => (
                      <tr key={member.id} className="border-b border-border hover:bg-accent/10">
                        <td className="py-3 px-4">{member.faculty_name || member.user?.full_name || 'N/A'}</td>
                        <td className="py-3 px-4">{member.employee_id || 'N/A'}</td>
                        <td className="py-3 px-4">{member.department}</td>
                        <td className="py-3 px-4">{member.subject || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm font-semibold">{member.assigned_standard && member.assigned_division ? `${member.assigned_standard}-${member.assigned_division}` : 'Not Assigned'}</td>
                        <td className="py-3 px-4 text-sm">{member.user?.email || 'N/A'}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <button className="p-2 rounded hover:bg-accent/20 text-accent">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(member.id)} className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-950/30 text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredFaculty.length === 0 && <p className="text-center py-4 text-muted-foreground">No faculty found</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
