'use server'

import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable.')
}

if (!supabaseServiceKey) {
  throw new Error('Supabase key is required. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface AttendanceRecord {
  id: string
  student_id: string
  attendance_date: string
  status: 'present' | 'absent' | 'missing' | 'no_record'
  subject: string
  remarks?: string
}

interface MarkAttendanceData {
  student_id: string
  faculty_id: string
  attendance_date: string
  status: 'present' | 'absent' | 'missing'
  subject: string
  remarks?: string
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
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

    console.log('[v0] Student record ID:', data.id)
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error:', error)
    return { success: false, error: 'Failed to fetch student record' }
  }
}

export async function markAttendance(data: MarkAttendanceData): Promise<{
  success: boolean
  data?: AttendanceRecord
  error?: string
}> {
  try {
    const { data: record, error } = await supabase
      .from('attendance')
      .upsert({
        student_id: data.student_id,
        faculty_id: data.faculty_id,
        attendance_date: data.attendance_date,
        status: data.status,
        subject: data.subject,
        remarks: data.remarks,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: 'Failed to mark attendance' }
  }
}

export async function getStudentAttendance(studentId: string): Promise<{
  success: boolean
  data?: AttendanceRecord[]
  error?: string
}> {
  try {
    const { data: records, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: 'Failed to fetch attendance' }
  }
}

export async function getAttendanceByMonth(
  studentId: string,
  year: number,
  month: number
): Promise<{
  success: boolean
  data?: AttendanceRecord[]
  error?: string
}> {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = new Date(year, month, 0)
    const endDateStr = endDate.toISOString().split('T')[0]

    const { data: records, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDateStr)
      .order('attendance_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: 'Failed to fetch attendance' }
  }
}

export async function getClassAttendance(
  facultyId: string,
  attendanceDate: string
): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const { data: records, error } = await supabase
      .from('attendance')
      .select(
        `
        *,
        student_id (
          id,
          user_id,
          roll_number,
          standard,
          division
        )
      `
      )
      .eq('faculty_id', facultyId)
      .eq('attendance_date', attendanceDate)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: records }
  } catch (error) {
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
    const { data: records, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId)
      .neq('status', 'no_record')

    if (error) {
      return { success: false, error: error.message }
    }

    const stats = {
      total: records.length,
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      missing: records.filter((r) => r.status === 'missing').length,
      percentage: 0,
    }

    stats.percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0

    return { success: true, data: stats }
  } catch (error) {
    return { success: false, error: 'Failed to fetch attendance stats' }
  }
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

    const malformedRecords = normalizedRecords.filter((record) => !isUuid(record.student_id))
    if (malformedRecords.length > 0) {
      console.error('[v0] Malformed student IDs in attendance records:', malformedRecords)
      return { success: false, error: `${malformedRecords.length} record(s) have invalid student IDs` }
    }

    // Validate that all students exist
    const studentIds = normalizedRecords.map((record) => record.student_id)
    const { data: existingStudents, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id')
      .in('id', studentIds)

    if (studentError) {
      console.error('[v0] Error checking students:', studentError)
      return { success: false, error: 'Error validating students' }
    }

    const validStudentIds = new Set(existingStudents?.map((student) => student.id) || [])
    const invalidRecords = normalizedRecords.filter((record) => !validStudentIds.has(record.student_id))

    if (invalidRecords.length > 0) {
      console.error('[v0] Invalid students in attendance records:', invalidRecords)
      return { success: false, error: `${invalidRecords.length} student(s) not found in database` }
    }

    // First, delete existing attendance records for these students on this date
    const { error: deleteError } = await supabaseAdmin
      .from('attendance')
      .delete()
      .in('student_id', studentIds)
      .eq('attendance_date', normalizedRecords[0].attendance_date)

    if (deleteError) {
      console.error('[v0] Error deleting existing records:', deleteError)
      return { success: false, error: 'Error clearing previous attendance' }
    }

    // Then insert the new records
    const { error } = await supabase
      .from('attendance')
      .insert(normalizedRecords)

    if (error) {
      console.error('[v0] Attendance insert error:', error)
      return { success: false, error: error.message }
    }

    console.log('[v0] Attendance marked successfully for', records.length, 'students')
    return { success: true }
  } catch (error) {
    console.error('[v0] Mark attendance error:', error)
    return { success: false, error: 'Failed to mark bulk attendance' }
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
    const { data: assignments, error } = await supabaseAdmin
      .from('faculty_student_assignments')
      .select(
        `
        id,
        student_id,
        faculty_id,
        assigned_date,
        students (
          id,
          standard,
          division,
          student_name,
          roll_number
        )
      `
      )
      .eq('faculty_id', facultyId)
      .order('assigned_date', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching assigned students for attendance:', error)
      return { success: false, error: error.message }
    }

    // Map and flatten the data, filtering out assignments where student doesn't exist
    const mappedData = assignments
      ?.filter((assignment: any) => assignment.students !== null)
      .map((assignment: any) => ({
        id: assignment.id,
        student_id: assignment.student_id,
        faculty_id: assignment.faculty_id,
        student_name: assignment.students?.student_name || 'N/A',
        class: assignment.students?.standard || 'N/A',
        division: assignment.students?.division || 'N/A',
        roll_number: assignment.students?.roll_number,
      })) || []

    console.log('[v0] Mapped attendance students:', mappedData)

    return { success: true, data: mappedData }
  } catch (error) {
    console.error('[v0] Error in getAssignedStudentsForAttendance:', error)
    return { success: false, error: 'Failed to fetch assigned students' }
  }
}
