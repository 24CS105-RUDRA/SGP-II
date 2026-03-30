'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Edit2, Trash2, Plus } from 'lucide-react'
import { getAllFaculty, createFaculty, updateFaculty, deleteFaculty } from '@/lib/actions/faculty'
import { validatePhoneNumber, validateEmail, validateName } from '@/lib/validations'
import type { FacultyProfile } from '@/types'

interface FormErrors {
phone_number?: string
full_name?: string
email?: string
password?: string
}

export default function FacultyProfilesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [faculty, setFaculty] = useState<FacultyProfile[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
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

    const errors: FormErrors = {}

    if (!editingFacultyId) {
      const phoneResult = validatePhoneNumber(formData.phone_number, { required: true })
      if (!phoneResult.isValid) {
        errors.phone_number = phoneResult.errors.join(', ')
      }

      const emailResult = validateEmail(formData.email, { required: true })
      if (!emailResult.isValid) {
        errors.email = emailResult.errors.join(', ')
      }

      const nameResult = validateName(formData.full_name, 'Full name')
      if (!nameResult.isValid) {
        errors.full_name = nameResult.errors.join(', ')
      }

      if (formData.password && formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
      }
    }

    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    if (!formData.phone_number || !formData.password || !formData.full_name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const submitData = {
        ...formData,
        username: formData.phone_number.replace(/\D/g, ''),
      }
      const result = await createFaculty(submitData)

      if (result.success) {
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
        setFormErrors({})
        setShowForm(false)
        await fetchFaculty()
        alert(`Faculty added successfully!\n\nLogin credentials:\nUsername (Phone): ${submitData.username}\nPassword: ${submitData.password}`)
      } else {
        alert(`Error: ${result.error}`)
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
        await fetchFaculty()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('[v0] Delete error:', error)
    }
  }

  const resetForm = () => {
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
    setFormErrors({})
  }

  const handleEditFaculty = (member: FacultyProfile) => {
    setEditingFacultyId(member.id)
    setFormData({
      username: member.user?.username || '',
      password: '',
      full_name: member.faculty_name || member.user?.full_name || '',
      email: member.user?.email || '',
      employee_id: member.employee_id || '',
      department: member.department || 'Mathematics',
      subject: member.subject || '',
      phone_number: member.phone_number || '',
      assigned_standard: member.assigned_standard || '',
      assigned_division: member.assigned_division || '',
    })
    setShowForm(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingFacultyId) return
    if (!formData.full_name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const result = await updateFaculty(editingFacultyId, {
        full_name: formData.full_name,
        email: formData.email,
        employee_id: formData.employee_id,
        department: formData.department,
        subject: formData.subject,
        phone_number: formData.phone_number,
        assigned_standard: formData.assigned_standard,
        assigned_division: formData.assigned_division,
      })

      if (result.success) {
        alert('Faculty updated successfully!')
        setEditingFacultyId(null)
        resetForm()
        setShowForm(false)
        await fetchFaculty()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('[v0] Update error:', error)
      alert('Failed to update faculty')
    } finally {
      setSubmitting(false)
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
        <div className="p-4 pl-16 md:p-8">
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-primary">Faculty Management</h1>
            <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {editingFacultyId ? 'Edit Faculty' : 'Add New Faculty'}
            </Button>
          </div>

          {showForm && (
            <Card className="mb-8 border-2 border-accent">
              <CardHeader>
                <CardTitle>{editingFacultyId ? 'Edit Faculty' : 'Add New Faculty'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingFacultyId ? handleSaveEdit : handleSubmit} className="grid md:grid-cols-2 gap-4">
                  {!editingFacultyId && (
                    <>
                      <div>
                        <Label>Phone Number (Username) *</Label>
                        <Input
                          value={formData.phone_number}
                          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                          placeholder="10-digit mobile number"
                          required
                        />
                        {formErrors.phone_number && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.phone_number}</p>
                        )}
                      </div>
                      <div>
                        <Label>Password * (min 6 characters)</Label>
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required
                        />
                        {formErrors.password && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                        )}
                      </div>
                    </>
                  )}
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
                    {formErrors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.full_name}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
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
                  {editingFacultyId && (
                    <div>
                      <Label>Phone Number</Label>
                      <Input value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                    </div>
                  )}
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
                      {submitting ? (editingFacultyId ? 'Saving...' : 'Creating...') : (editingFacultyId ? 'Save Changes' : 'Add Faculty')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowForm(false)
                      setEditingFacultyId(null)
                      resetForm()
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

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
                      <th className="text-left py-3 px-4 font-semibold">Phone (Username)</th>
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
                        <td className="py-3 px-4 text-sm font-mono">{member.phone_number || member.user?.username || 'N/A'}</td>
                        <td className="py-3 px-4">{member.employee_id || 'N/A'}</td>
                        <td className="py-3 px-4">{member.department}</td>
                        <td className="py-3 px-4">{member.subject || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm font-semibold">{member.assigned_standard && member.assigned_division ? `${member.assigned_standard}-${member.assigned_division}` : 'Not Assigned'}</td>
                        <td className="py-3 px-4 text-sm">{member.user?.email || 'N/A'}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <button onClick={() => handleEditFaculty(member)} className="p-2 rounded hover:bg-accent/20 text-accent">
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
