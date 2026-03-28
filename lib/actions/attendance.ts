'use server'

import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase'

const supabase = createClient()

interface AttendanceRecord {
  student_id: string
  status: 'present' | 'absent' | 'missing'
}

interface ClassAttendanceDoc {
  id: string
  standard: string
  division: string
  attendance_date: string
  subject: string
  faculty_id: string
  marked_by: string
  attendance_records: AttendanceRecord[]
  created_at: string
  updated_at: string
}

export async function getStudentRecordByUserId(userId: string): Promise<{
  success: boolean
  data?: { id: string; standard: string; division: string }
  error?: string
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('students')
      .select('id, standard, division')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('[v0] Error fetching student record:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'Student record not found' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error:', error)
    return { success: false, error: 'Failed to fetch student record' }
  }
}

export async function getStudentAttendance(studentId: string): Promise<{
  success: boolean
  data?: Array<{
    id: string
    attendance_date: string
    status: 'present' | 'absent' | 'missing' | 'no_record'
  }>
  error?: string
}> {
  try {
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('standard, division')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return { success: false, error: 'Student not found' }
    }

    const { data: attendanceDocs, error } = await supabaseAdmin
      .from('attendance')
      .select('id, attendance_date, attendance_records')
      .eq('standard', student.standard)
      .eq('division', student.division)
      .order('attendance_date', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching attendance:', error)
      return { success: false, error: error.message }
    }

    const result = ((attendanceDocs as any[]) || []).map((doc: any) => {
      const studentRecord = doc.attendance_records?.find(
        (r: AttendanceRecord) => r.student_id === studentId
      )
      return {
        id: doc.id,
        attendance_date: doc.attendance_date,
        status: studentRecord?.status || 'no_record',
      }
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('[v0] Error:', error)
    return { success: false, error: 'Failed to fetch attendance' }
  }
}

export async function getAttendanceByMonth(
  studentId: string,
  year: number,
  month: number
): Promise<{
  success: boolean
  data?: Array<{
    id: string
    attendance_date: string
    status: 'present' | 'absent' | 'missing' | 'no_record'
  }>
  error?: string
}> {
  try {
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('standard, division')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return { success: false, error: 'Student not found' }
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    const { data: attendanceDocs, error } = await supabaseAdmin
      .from('attendance')
      .select('id, attendance_date, attendance_records')
      .eq('standard', student.standard)
      .eq('division', student.division)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate)
      .order('attendance_date', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching attendance:', error)
      return { success: false, error: error.message }
    }

    const result = (attendanceDocs || []).map((doc: any) => {
      const studentRecord = doc.attendance_records?.find(
        (r: AttendanceRecord) => r.student_id === studentId
      )
      return {
        id: doc.id,
        attendance_date: doc.attendance_date,
        status: studentRecord?.status || 'no_record',
      }
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('[v0] Error:', error)
    return { success: false, error: 'Failed to fetch attendance' }
  }
}

export async function getClassAttendance(
  facultyId: string,
  attendanceDate: string,
  standard?: string,
  division?: string
): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    let query = supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('attendance_date', attendanceDate)

    if (standard) {
      query = query.eq('standard', standard)
    }
    if (division) {
      query = query.eq('division', division)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error:', error)
    return { success: false, error: 'Failed to fetch class attendance' }
  }
}

export async function getAttendanceStats(studentId: string): Promise<{
  success: boolean
  data?: {
    total: number
    present: number
    absent: number
    missing: number
    percentage: number
  }
  error?: string
}> {
  try {
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('standard, division')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      return { success: false, error: 'Student not found' }
    }

    const { data: attendanceDocs, error } = await supabaseAdmin
      .from('attendance')
      .select('attendance_records')
      .eq('standard', student.standard)
      .eq('division', student.division)

    if (error) {
      return { success: false, error: error.message }
    }

    let present = 0
    let absent = 0
    let missing = 0

    ;(attendanceDocs || []).forEach((doc: any) => {
      const studentRecord = doc.attendance_records?.find(
        (r: AttendanceRecord) => r.student_id === studentId
      )
      if (studentRecord) {
        if (studentRecord.status === 'present') present++
        else if (studentRecord.status === 'absent') absent++
        else if (studentRecord.status === 'missing') missing++
      }
    })

    const total = present + absent + missing

    return {
      success: true,
      data: {
        total,
        present,
        absent,
        missing,
        percentage: total > 0 ? (present / total) * 100 : 0,
      },
    }
  } catch (error) {
    console.error('[v0] Error:', error)
    return { success: false, error: 'Failed to fetch attendance stats' }
  }
}

interface MarkAttendanceData {
  student_id: string
  faculty_id: string
  attendance_date: string
  status: 'present' | 'absent' | 'missing'
  subject: string
  standard: string
  division: string
  remarks?: string
}

export async function markBulkAttendance(
  records: MarkAttendanceData[]
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    if (!records || records.length === 0) {
      return { success: false, error: 'No attendance records provided' }
    }

    const normalizedRecords = records.map((record) => ({
      ...record,
      student_id: (record.student_id || '').trim(),
    }))

    const firstRecord = normalizedRecords[0]
    const { standard, division, attendance_date, subject, faculty_id } = firstRecord

    if (!standard || !division) {
      return { success: false, error: 'Standard and division are required' }
    }

    const studentIds = normalizedRecords.map((r) => r.student_id)
    const { data: existingStudents, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id')
      .in('id', studentIds)

    if (studentError) {
      console.error('[v0] Error checking students:', studentError)
      return { success: false, error: 'Error validating students' }
    }

    const validStudentIds = new Set(existingStudents?.map((s: { id: string }) => s.id) || [])
    const invalidRecords = normalizedRecords.filter((r) => !validStudentIds.has(r.student_id))

    if (invalidRecords.length > 0) {
      console.error('[v0] Invalid students:', invalidRecords)
      return { success: false, error: `${invalidRecords.length} student(s) not found` }
    }

    const attendanceRecords: AttendanceRecord[] = normalizedRecords.map((record) => ({
      student_id: record.student_id,
      status: record.status,
    }))

    const markedBy = faculty_id

    console.log('[v0] Inserting attendance for:', { standard, division, attendance_date, subject, studentCount: attendanceRecords.length })

    // Delete existing attendance for this class/date/subject first
    const { error: deleteError } = await supabaseAdmin
      .from('attendance')
      .delete()
      .eq('standard', standard)
      .eq('division', division)
      .eq('attendance_date', attendance_date)
      .eq('subject', subject)

    if (deleteError) {
      console.error('[v0] Delete error:', deleteError)
      return { success: false, error: 'Error clearing previous attendance: ' + deleteError.message }
    }

    console.log('[v0] Creating new attendance document')
    const { error: insertError } = await supabaseAdmin
      .from('attendance')
      .insert({
        standard,
        division,
        attendance_date,
        subject,
        faculty_id,
        marked_by: markedBy,
        attendance_records: attendanceRecords,
      })

    if (insertError) {
      console.error('[v0] Insert error:', insertError)
      return { success: false, error: insertError.message }
    }

    console.log('[v0] Attendance marked successfully for', records.length, 'students')
    return { success: true }
  } catch (error: any) {
    console.error('[v0] Mark attendance error:', error)
    const errorMessage = error?.message || error?.toString() || 'Failed to mark bulk attendance'
    return { success: false, error: errorMessage }
  }
}

export async function getStudentsForAttendance(standard: string, division?: string): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    let query = supabase
      .from('students')
      .select(
        `
        id,
        roll_number,
        standard,
        division,
        user_id (
          full_name,
          username
        )
      `
      )
      .eq('standard', standard)

    if (division) {
      query = query.eq('division', division)
    }

    const { data: students, error } = await query.order('roll_number')

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: students }
  } catch (error) {
    return { success: false, error: 'Failed to fetch students' }
  }
}

export async function getAssignedStudentsForAttendance(facultyId: string): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const { data: faculty, error: facultyError } = await supabaseAdmin
      .from('faculty')
      .select('assigned_standard, assigned_division')
      .eq('id', facultyId)
      .single()

    if (facultyError || !faculty) {
      return { success: false, error: 'Faculty not found' }
    }

    const { data: students, error } = await supabaseAdmin
      .from('students')
      .select('id, standard, division, student_name, roll_number')
      .eq('standard', faculty.assigned_standard)
      .eq('division', faculty.assigned_division)
      .order('roll_number')

    if (error) {
      console.error('[v0] Error fetching students:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: students || [] }
  } catch (error) {
    console.error('[v0] Error:', error)
    return { success: false, error: 'Failed to fetch assigned students' }
  }
}
