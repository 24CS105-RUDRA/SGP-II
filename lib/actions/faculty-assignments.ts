'use server'

import { supabaseAdmin } from '@/lib/supabase'

interface StudentAssignment {
  id: string
  student_id: string
  faculty_id: string
  student_name: string
  faculty_name: string
  class: string
  division: string
  assigned_at: string
}

export async function getStudentsForFaculty(
  facultyId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('faculty_student_assignments')
      .select(`
        id,
        student_id,
        faculty_id,
        assigned_date,
        students (
          id,
          standard,
          division,
          student_name,
          user_id
        )
      `)
      .eq('faculty_id', facultyId)
      .order('assigned_date', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching assigned students:', error)
      return { success: false, error: error.message }
    }

    // Map the data to flatten student information
    const mappedData = data?.map((assignment: any) => ({
      id: assignment.id,
      student_id: assignment.student_id,
      faculty_id: assignment.faculty_id,
      assigned_date: assignment.assigned_date,
      assigned_at: assignment.assigned_date,
      student_name: assignment.students?.student_name || 'N/A',
      standard: assignment.students?.standard || 'N/A',
      class: assignment.students?.standard || 'N/A',
      division: assignment.students?.division || 'N/A',
    })) || []

    return { success: true, data: mappedData }
  } catch (error) {
    console.error('[v0] Error in getStudentsForFaculty:', error)
    return { success: false, error: 'Failed to fetch assigned students' }
  }
}

export async function autoAssignStudentsToFaculty(): Promise<{
  success: boolean
  message?: string
  error?: string
  assigned_count?: number
}> {
  try {
    // Get all faculty with assigned class and division
    const { data: faculty, error: facultyError } = await supabaseAdmin
      .from('faculty')
      .select('id, assigned_standard, assigned_division, user_id, users(full_name)')
      .not('assigned_standard', 'is', null)
      .not('assigned_division', 'is', null)

    if (facultyError) {
      console.error('[v0] Error fetching faculty:', facultyError)
      return { success: false, error: facultyError.message }
    }

    if (!faculty || faculty.length === 0) {
      return { success: true, message: 'No faculty with assigned classes found', assigned_count: 0 }
    }

    let totalAssigned = 0

    // For each faculty, find matching students
    for (const f of faculty) {
      const { data: students, error: studentError } = await supabaseAdmin
        .from('students')
        .select('id, standard, division, user_id, users(full_name)')
        .eq('standard', f.assigned_standard)
        .eq('division', f.assigned_division)

      if (studentError) {
        console.error(`[v0] Error fetching students for faculty ${f.id}:`, studentError)
        continue
      }

      if (!students || students.length === 0) {
        continue
      }

      // Get faculty name
      const facultyName = f.users?.full_name || 'Unknown Faculty'

      // Clear existing assignments for this faculty
      await supabaseAdmin
        .from('faculty_student_assignments')
        .delete()
        .eq('faculty_id', f.id)

      // Create new assignments
      const assignmentRecords = students.map((student: any) => ({
        student_id: student.id,
        faculty_id: f.id,
      }))

      const { error: insertError } = await supabaseAdmin
        .from('faculty_student_assignments')
        .insert(assignmentRecords)

      if (insertError) {
        console.error(`[v0] Error creating assignments for faculty ${f.id}:`, insertError)
        continue
      }

      totalAssigned += students.length
    }

    return { success: true, message: `Successfully assigned ${totalAssigned} students to faculty`, assigned_count: totalAssigned }
  } catch (error) {
    console.error('[v0] Error in autoAssignStudentsToFaculty:', error)
    return { success: false, error: 'Failed to auto-assign students' }
  }
}

export async function removeStudentAssignment(
  assignmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('faculty_student_assignments')
      .delete()
      .eq('id', assignmentId)

    if (error) {
      console.error('[v0] Error removing assignment:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Error in removeStudentAssignment:', error)
    return { success: false, error: 'Failed to remove assignment' }
  }
}
