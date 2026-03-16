'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable.')
}

if (!supabaseServiceKey) {
  throw new Error('Supabase key is required. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface FacultyProfile {
  id: string
  user_id: string
  employee_id: string
  department: string
  subject: string
  faculty_name?: string
  phone_number?: string
  assigned_standard?: string
  assigned_division?: string
  user?: {
    full_name: string
    email: string
    username: string
  }
}

interface CreateFacultyData {
  username: string
  password: string
  full_name: string
  email: string
  employee_id: string
  department: string
  subject: string
  phone_number?: string
  assigned_standard?: string
  assigned_division?: string
}

export async function createFaculty(data: CreateFacultyData): Promise<{
  success: boolean
  data?: FacultyProfile
  error?: string
}> {
  try {
    const { default: bcrypt } = await import('bcryptjs')

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

    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        username: data.username,
        password_hash: passwordHash,
        full_name: data.full_name,
        email: data.email,
        role: 'faculty',
      })
      .select()
      .single()

    if (userError) {
      console.log('[v0] User creation error:', userError)
      return { success: false, error: userError.message }
    }

    // Create faculty profile
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .insert({
        user_id: user.id,
        employee_id: data.employee_id,
        department: data.department,
        subject: data.subject,
        faculty_name: data.full_name,
        phone_number: data.phone_number,
        assigned_standard: data.assigned_standard || null,
        assigned_division: data.assigned_division || null,
      })
      .select()
      .single()

    if (facultyError) {
      console.log('[v0] Faculty creation error:', facultyError)
      return { success: false, error: facultyError.message }
    }

    return {
      success: true,
      data: {
        ...faculty,
        user: {
          full_name: user.full_name,
          email: user.email,
          username: user.username,
        },
      },
    }
  } catch (error) {
    console.log('[v0] Create faculty exception:', error)
    return { success: false, error: 'Failed to create faculty' }
  }
}

export async function getFacultyProfile(facultyId: string): Promise<{
  success: boolean
  data?: FacultyProfile
  error?: string
}> {
  try {
    const { data: faculty, error } = await supabase
      .from('faculty')
      .select(
        `
        *,
        user:user_id (
          full_name,
          email,
          username
        )
      `
      )
      .eq('id', facultyId)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: faculty }
  } catch (error) {
    return { success: false, error: 'Failed to fetch faculty profile' }
  }
}

export async function getAllFaculty(): Promise<{
  success: boolean
  data?: FacultyProfile[]
  error?: string
}> {
  try {
    const { data: faculty, error } = await supabase
      .from('faculty')
      .select(
        `
        *,
        user:user_id (
          full_name,
          email,
          username
        )
      `
      )
      .order('created_at')

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: faculty }
  } catch (error) {
    return { success: false, error: 'Failed to fetch faculty' }
  }
}

export async function updateFaculty(
  facultyId: string,
  updates: Partial<CreateFacultyData>
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { data: faculty, error: fetchError } = await supabase
      .from('faculty')
      .select('user_id')
      .eq('id', facultyId)
      .single()

    if (fetchError) {
      return { success: false, error: 'Faculty not found' }
    }

    const facultyUpdates: any = {}
    if (updates.full_name !== undefined) facultyUpdates.faculty_name = updates.full_name || null
    if (updates.employee_id !== undefined) facultyUpdates.employee_id = updates.employee_id || null
    if (updates.department !== undefined) facultyUpdates.department = updates.department || null
    if (updates.subject !== undefined) facultyUpdates.subject = updates.subject || null
    if (updates.phone_number !== undefined) facultyUpdates.phone_number = updates.phone_number || null
    if (updates.assigned_standard !== undefined) facultyUpdates.assigned_standard = updates.assigned_standard || null
    if (updates.assigned_division !== undefined) facultyUpdates.assigned_division = updates.assigned_division || null

    if (Object.keys(facultyUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('faculty')
        .update(facultyUpdates)
        .eq('id', facultyId)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    }

    const userUpdates: any = {}
    if (updates.full_name !== undefined) userUpdates.full_name = updates.full_name
    if (updates.email !== undefined) userUpdates.email = updates.email

    if (Object.keys(userUpdates).length > 0) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', faculty.user_id)

      if (userUpdateError) {
        return { success: false, error: userUpdateError.message }
      }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update faculty' }
  }
}

export async function deleteFaculty(facultyId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { data: faculty, error: fetchError } = await supabase
      .from('faculty')
      .select('user_id')
      .eq('id', facultyId)
      .single()

    if (fetchError) {
      return { success: false, error: 'Faculty not found' }
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', faculty.user_id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete faculty' }
  }
}

export async function getFacultyByUserId(userId: string): Promise<{
  success: boolean
  data?: FacultyProfile & { assigned_standard?: string; assigned_division?: string }
  error?: string
}> {
  try {
    let faculty: any = null
    let error: any = null

    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await supabase
        .from('faculty')
        .select(
          `
          *,
          user:user_id (
            full_name,
            email,
            username
          )
        `
        )
        .eq('user_id', userId)
        .single()

      faculty = result.data
      error = result.error

      const isFetchFailure = typeof error?.message === 'string' && error.message.toLowerCase().includes('fetch failed')
      if (!isFetchFailure) {
        break
      }

      await sleep(250)
    }

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: faculty }
  } catch (error) {
    return { success: false, error: 'Failed to fetch faculty profile' }
  }
}
