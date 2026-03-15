'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, Edit, Trash2, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { getAllStudents, createStudent, deleteStudent, updateStudent } from '@/lib/actions/students'
import Loading from './loading'

interface StudentProfile {
  id: string
  user_id: string
  roll_number: string
  standard: string
  division: string
  student_name?: string
  phone_number?: string
  parent_contact?: string
  date_of_birth?: string
  user?: {
    full_name: string
    email: string
    username: string
  }
}

export default function StudentProfilesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<StudentProfile[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    roll_number: '',
    standard: '',
    division: '',
    phone_number: '',
    parent_contact: '',
    date_of_birth: '',
  })

  const fetchStudents = async () => {
    const result = await getAllStudents()
    if (result.success) {
      console.log('[v0] Students fetched:', result.data)
      setStudents(result.data || [])
    } else {
      console.error('[v0] Error fetching students:', result.error)
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
    fetchStudents()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.password || !formData.full_name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const result = await createStudent(formData)

      if (result.success) {
        console.log('[v0] Student created:', result.data)
        setFormData({
          username: '',
          password: '',
          full_name: '',
          email: '',
          roll_number: '',
          standard: '',
          division: '',
          phone_number: '',
          parent_contact: '',
          date_of_birth: '',
        })
        setShowForm(false)
        await fetchStudents()
        alert('Student added successfully! Credentials: ' + formData.username + ' / ' + formData.password)
      } else {
        alert(`Error: ${result.error}`)
        console.error('[v0] Create student error:', result.error)
      }
    } catch (error) {
      console.error('[v0] Submit error:', error)
      alert('Failed to create student')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const result = await deleteStudent(studentId)
      if (result.success) {
        console.log('[v0] Student deleted')
        await fetchStudents()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('[v0] Delete error:', error)
    }
  }

  const handleEditStudent = (student: StudentProfile) => {
    setEditingStudentId(student.id)
    setFormData({
      username: typeof student.user_id === 'object' ? student.user_id.username : '',
      password: '',
      full_name: student.student_name || (typeof student.user_id === 'object' ? student.user_id.full_name : ''),
      email: typeof student.user_id === 'object' ? student.user_id.email : '',
      roll_number: student.roll_number,
      standard: student.standard,
      division: student.division,
      phone_number: student.phone_number || '',
      parent_contact: student.parent_contact || '',
      date_of_birth: student.date_of_birth || '',
    })
    setShowForm(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingStudentId) return

    try {
      const result = await updateStudent(editingStudentId, {
        full_name: formData.full_name,
        email: formData.email,
        roll_number: formData.roll_number,
        standard: formData.standard,
        division: formData.division,
        phone_number: formData.phone_number,
        parent_contact: formData.parent_contact,
        date_of_birth: formData.date_of_birth,
      })

      if (result.success) {
        alert('Student updated successfully!')
        setEditingStudentId(null)
        setFormData({
          username: '',
          password: '',
          full_name: '',
          email: '',
          roll_number: '',
          standard: '',
          division: '',
          phone_number: '',
          parent_contact: '',
          date_of_birth: '',
        })
        setShowForm(false)
        await fetchStudents()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('[v0] Update error:', error)
      alert('Failed to update student')
    }
  }

  // Group students by class and division
  const groupedStudents = students.reduce((acc, student) => {
    const classKey = student.standard || 'Unassigned'
    const divisionKey = student.division || 'Unassigned'
    
    if (!acc[classKey]) {
      acc[classKey] = {}
    }
    if (!acc[classKey][divisionKey]) {
      acc[classKey][divisionKey] = []
    }
    acc[classKey][divisionKey].push(student)
    return acc
  }, {} as Record<string, Record<string, StudentProfile[]>>)

  const sortedClasses = Object.keys(groupedStudents).sort((a, b) => {
    const aNum = parseInt(a)
    const bNum = parseInt(b)
    if (isNaN(aNum)) return 1
    if (isNaN(bNum)) return -1
    return aNum - bNum
  })

  const toggleDivision = (divisionKey: string) => {
    const newExpanded = new Set(expandedDivisions)
    if (newExpanded.has(divisionKey)) {
      newExpanded.delete(divisionKey)
    } else {
      newExpanded.add(divisionKey)
    }
    setExpandedDivisions(newExpanded)
  }

  const toggleClass = (classNum: string) => {
    setSelectedClass(selectedClass === classNum ? null : classNum)
    setExpandedDivisions(new Set())
  }

  const getDivisionKey = (classNum: string, division: string) => `${classNum}-${division}`

  const selectClassDivision = (classNum: string, division: string) => {
    setSelectedClass(classNum)
    setSelectedDivision(division)
  }

  const getAllDivisionsForClass = (classNum: string) => {
    return Object.keys(groupedStudents[classNum] || {}).sort()
  }

  const getStudentsForClassDivision = (classNum: string, division: string) => {
    return (groupedStudents[classNum]?.[division] || []).filter(student =>
      (student.student_name || student.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof student.user_id === 'object' && student.user_id?.email ? student.user_id.email : student.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (loading) return <Loading />
  if (!user) return null

  const filteredStudents = students.filter(student =>
    (student.student_name || student.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeSection="student-profiles" />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-primary">Student Profiles</h1>
            <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Student
            </Button>
          </div>

          {/* Add/Edit Student Form */}
          {showForm && (
            <Card className="mb-8 border-2 border-accent">
              <CardHeader>
                <CardTitle>{editingStudentId ? 'Edit Student' : 'Add New Student'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingStudentId ? handleSaveEdit : handleSubmit} className="grid md:grid-cols-2 gap-4">
                  {!editingStudentId && (
                    <>
                      <div>
                        <Label>Username *</Label>
                        <Input value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                      </div>
                      <div>
                        <Label>Password *</Label>
                        <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                      </div>
                    </>
                  )}
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Roll Number</Label>
                    <Input value={formData.roll_number} onChange={(e) => setFormData({...formData, roll_number: e.target.value})} />
                  </div>
                  <div>
                    <Label>Class</Label>
                    <select className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" value={formData.standard} onChange={(e) => setFormData({...formData, standard: e.target.value, division: ''})}>
                      <option value="">Select Class</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(cls => <option key={cls} value={cls.toString()}>Class {cls}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Division</Label>
                    {!formData.standard ? (
                      <select disabled className="w-full border border-border rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-foreground cursor-not-allowed" value="">
                        <option>Select Class First</option>
                      </select>
                    ) : (
                      <select className="w-full border border-border rounded px-3 py-2 bg-background text-foreground" value={formData.division} onChange={(e) => setFormData({...formData, division: e.target.value})}>
                        <option value="">Select Division</option>
                        <option value="A">Division A</option>
                        <option value="B">Division B</option>
                        <option value="C">Division C</option>
                        <option value="D">Division D</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                  </div>
                  <div>
                    <Label>Parent Contact</Label>
                    <Input value={formData.parent_contact} onChange={(e) => setFormData({...formData, parent_contact: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <Button type="submit" disabled={submitting} className="bg-accent hover:bg-accent/90">
                      {submitting ? (editingStudentId ? 'Saving...' : 'Creating...') : (editingStudentId ? 'Save Changes' : 'Add Student')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowForm(false)
                      setEditingStudentId(null)
                      setFormData({
                        username: '',
                        password: '',
                        full_name: '',
                        email: '',
                        roll_number: '',
                        standard: '',
                        division: '',
                        phone_number: '',
                        parent_contact: '',
                        date_of_birth: '',
                      })
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name, roll number, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Class-Division Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Select Class and Division</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedClasses.map((classNum) =>
                getAllDivisionsForClass(classNum).map((division) => {
                  const divisionStudents = groupedStudents[classNum][division] || []
                  const isSelected = selectedClass === classNum && selectedDivision === division
                  
                  return (
                    <button
                      key={`${classNum}-${division}`}
                      onClick={() => selectClassDivision(classNum, division)}
                      className={`p-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary'
                          : 'bg-card border-2 border-border hover:border-primary hover:shadow-md'
                      }`}
                    >
                      <div className="text-center">
                        <p className={`text-lg font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                          Class {classNum}
                        </p>
                        <p className={`text-sm ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          Division {division}
                        </p>
                        <Badge className={`mt-2 ${isSelected ? 'bg-primary-foreground text-primary' : 'bg-accent'}`}>
                          {divisionStudents.length}
                        </Badge>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Students Table for Selected Class-Division */}
          {selectedClass && selectedDivision && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Class {selectedClass} - Division {selectedDivision} ({getStudentsForClassDivision(selectedClass, selectedDivision).length} students)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getStudentsForClassDivision(selectedClass, selectedDivision).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No students found for this class and division.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Roll No</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Parent Contact</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">DOB</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getStudentsForClassDivision(selectedClass, selectedDivision).map((student) => (
                          <tr key={student.id} className="border-b border-border hover:bg-accent/5">
                            <td className="py-3 px-4 font-medium">{student.student_name || student.user?.full_name || 'N/A'}</td>
                            <td className="py-3 px-4">{student.roll_number || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm">{typeof student.user_id === 'object' && student.user_id?.email ? student.user_id.email : student.user?.email || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm">{student.phone_number || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm">{student.parent_contact || 'N/A'}</td>
                            <td className="py-3 px-4 text-sm">{student.date_of_birth || 'N/A'}</td>
                            <td className="py-3 px-4 flex gap-2">
                              <button onClick={() => handleEditStudent(student)} className="p-2 hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                                <Edit className="w-4 h-4 text-primary" />
                              </button>
                              <button onClick={() => handleDelete(student.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-lg transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
