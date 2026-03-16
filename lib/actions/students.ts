'use server'

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable.')
}

if (!supabaseServiceKey) {
  throw new Error('Supabase key is required. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

interface CreateStudentData {
  username: string
  password: string
  full_name: string
  email: string
  roll_number: string
  standard: string
  division: string
  phone_number?: string
  parent_contact?: string
  date_of_birth?: string
}

function normalizeOptional(value?: string): string | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function createStudent(data: CreateStudentData): Promise<{
  success: boolean
  data?: StudentProfile
  error?: string
}> {
  try {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', data.username)
      .maybeSingle()

    if (existingUser) {
      return { success: false, error: `Username '${data.username}' already exists. Please use a different username.` }
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .maybeSingle()

    if (existingEmail) {
      return { success: false, error: `Email '${data.email}' already exists. Please use a different email.` }
    }

    // Check if roll number already exists in the same class and division
    const { data: existingRollNumber } = await supabase
      .from('students')
      .select('id')
      .eq('roll_number', data.roll_number)
      .eq('standard', data.standard)
      .eq('division', data.division)
      .maybeSingle()

    if (existingRollNumber) {
      return { success: false, error: `Roll number '${data.roll_number}' already exists in Class ${data.standard}-${data.division}. Please use a different roll number.` }
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        username: data.username,
        password_hash: passwordHash,
        full_name: data.full_name,
        email: data.email,
        role: 'student',
        year_of_study: data.standard,
        division: data.division,
        standard: data.standard,
      })
      .select()
      .single()

    if (userError) {
      console.log('[v0] User creation error:', userError)
      return { success: false, error: userError.message }
    }

    // Create student profile
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        user_id: user.id,
        roll_number: data.roll_number,
        standard: data.standard,
        division: data.division,
        student_name: data.full_name,
        phone_number: normalizeOptional(data.phone_number),
        parent_contact: normalizeOptional(data.parent_contact),
        date_of_birth: normalizeOptional(data.date_of_birth),
      })
      .select()
      .single()

    if (studentError) {
      console.log('[v0] Student creation error:', studentError)
      return { success: false, error: studentError.message }
    }

    return {
      success: true,
      data: {
        ...student,
        user: {
          full_name: user.full_name,
          email: user.email,
          username: user.username,
        },
      },
    }
  } catch (error) {
    console.log('[v0] Create student exception:', error)
    return { success: false, error: 'Failed to create student' }
  }
}

export async function getStudentsByClass(
  standard: string,
  division?: string
): Promise<{
  success: boolean
  data?: StudentProfile[]
  error?: string
}> {
  try {
    let query = supabase
      .from('students')
      .select(
        `
        *,
        user_id (
          full_name,
          email,
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

export async function getStudentProfile(studentId: string): Promise<{
  success: boolean
  data?: StudentProfile
  error?: string
}> {
  try {
    const { data: student, error } = await supabase
      .from('students')
      .select(
        `
        *,
        user_id (
          full_name,
          email,
          username
        )
      `
      )
      .eq('id', studentId)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: student }
  } catch (error) {
    return { success: false, error: 'Failed to fetch student profile' }
  }
}

export async function updateStudent(
  studentId: string,
  updates: Partial<CreateStudentData>
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Get student first
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('user_id')
      .eq('id', studentId)
      .single()

    if (fetchError) {
      return { success: false, error: 'Student not found' }
    }

    // Update student profile
    const studentUpdates: any = {}
    if (updates.roll_number !== undefined) studentUpdates.roll_number = updates.roll_number
    if (updates.phone_number !== undefined) studentUpdates.phone_number = normalizeOptional(updates.phone_number)
    if (updates.parent_contact !== undefined) studentUpdates.parent_contact = normalizeOptional(updates.parent_contact)
    if (updates.date_of_birth !== undefined) studentUpdates.date_of_birth = normalizeOptional(updates.date_of_birth)
    if (updates.standard !== undefined) studentUpdates.standard = updates.standard
    if (updates.division !== undefined) studentUpdates.division = updates.division

    if (Object.keys(studentUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('students')
        .update(studentUpdates)
        .eq('id', studentId)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    }

    // Update user profile if needed
    const userUpdates: any = {}
    if (updates.full_name !== undefined) userUpdates.full_name = updates.full_name
    if (updates.email !== undefined) userUpdates.email = updates.email

    if (Object.keys(userUpdates).length > 0) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', student.user_id)

      if (userUpdateError) {
        return { success: false, error: userUpdateError.message }
      }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update student' }
  }
}

export async function deleteStudent(studentId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Get student user_id
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('user_id')
      .eq('id', studentId)
      .single()

    if (fetchError) {
      return { success: false, error: 'Student not found' }
    }

    // Delete user (cascade will delete student)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', student.user_id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete student' }
  }
}

export async function getAllStudents(): Promise<{
  success: boolean
  data?: StudentProfile[]
  error?: string
}> {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select(
        `
        *,
        user_id (
          full_name,
          email,
          username
        )
      `
      )
      .order('standard')
      .order('division')
      .order('roll_number')

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: students }
  } catch (error) {
    return { success: false, error: 'Failed to fetch students' }
  }
}
