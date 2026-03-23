'use server'

import { createClient } from '@/lib/supabase'

const supabase = createClient()

interface Homework {
  id: string
  faculty_id: string
  standard: string
  division?: string
  subject: string
  title: string
  description?: string
  due_date: string
  assigned_date: string
  created_at: string
}

interface CreateHomeworkData {
  faculty_id: string
  standard: string
  division?: string
  subject: string
  title: string
  description?: string
  due_date: string
}

export async function createHomework(data: CreateHomeworkData): Promise<{
  success: boolean
  data?: Homework
  error?: string
}> {
  try {
    const { data: homework, error } = await supabase
      .from('homework')
      .insert({
        ...data,
        assigned_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: homework }
  } catch (error) {
    return { success: false, error: 'Failed to create homework' }
  }
}

export async function getHomeworkByStudent(studentId: string): Promise<{
  success: boolean
  data?: Homework[]
  error?: string
}> {
  try {
    // Get student details first
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('standard, division')
      .eq('id', studentId)
      .single()

    if (studentError) {
      return { success: false, error: 'Student not found' }
    }

    // Get homework for student's standard and division
    const { data: homework, error } = await supabase
      .from('homework')
      .select('*')
      .eq('standard', student.standard)
      .or(`division.is.null,division.eq.${student.division}`)
      .order('due_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: homework }
  } catch (error) {
    return { success: false, error: 'Failed to fetch homework' }
  }
}

export async function getHomeworkByFaculty(facultyId: string): Promise<{
  success: boolean
  data?: Homework[]
  error?: string
}> {
  try {
    const { data: homework, error } = await supabase
      .from('homework')
      .select('*')
      .eq('faculty_id', facultyId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: homework }
  } catch (error) {
    return { success: false, error: 'Failed to fetch homework' }
  }
}

export async function submitHomework(
  homeworkId: string,
  studentId: string
): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const { data: submission, error } = await supabase
      .from('homework_submissions')
      .upsert({
        homework_id: homeworkId,
        student_id: studentId,
        submission_date: new Date().toISOString(),
        status: 'submitted',
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: submission }
  } catch (error) {
    return { success: false, error: 'Failed to submit homework' }
  }
}

export async function getHomeworkSubmissions(homeworkId: string): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const { data: submissions, error } = await supabase
      .from('homework_submissions')
      .select(
        `
        *,
        student_id (
          id,
          roll_number,
          user_id (
            full_name
          )
        )
      `
      )
      .eq('homework_id', homeworkId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: submissions }
  } catch (error) {
    return { success: false, error: 'Failed to fetch submissions' }
  }
}

export async function gradeHomework(
  submissionId: string,
  grade: string,
  remarks?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('homework_submissions')
      .update({
        grade,
        remarks,
        status: 'graded',
      })
      .eq('id', submissionId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to grade homework' }
  }
}

export async function deleteHomework(homeworkId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', homeworkId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete homework' }
  }
}
