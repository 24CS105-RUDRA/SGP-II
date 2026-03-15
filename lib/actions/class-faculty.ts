import { createClient } from '@supabase/supabase-js'

// Use anon key by default - RLS policies handle access control
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials are required')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ClassFacultyAssignment {
  id: string
  standard: string
  division: string
  faculty_id: string
  faculty_name: string
  phone_number: string
  subject: string
  created_at: string
  updated_at: string
}

// Get all faculty for a specific class
export async function getClassFaculty(standard: string, division: string) {
  try {
    console.log('[v0] Fetching faculty for class:', standard, division)
    
    const { data, error } = await supabase
      .from('class_faculty_assignments')
      .select('id, standard, division, faculty_id, subject, created_at, updated_at')
      .eq('standard', standard)
      .eq('division', division)

    if (error) {
      console.error('[v0] Error fetching class faculty:', error)
      return { success: false, error: error.message }
    }

    console.log('[v0] Assignments found:', data?.length || 0)

    // Now get faculty details for each assignment
    if (!data || data.length === 0) {
      console.log('[v0] No faculty assigned to this class')
      return { success: true, data: [] }
    }

    // Fetch faculty details for each assignment
    const facultyIds = data.map((item: any) => item.faculty_id)
    const { data: facultyData, error: facultyError } = await supabase
      .from('faculty')
      .select('id, faculty_name, phone_number')
      .in('id', facultyIds)

    if (facultyError) {
      console.error('[v0] Error fetching faculty details:', facultyError)
      return { success: false, error: facultyError.message }
    }

    // Map faculty details to assignments
    const facultyMap = new Map(facultyData?.map((f: any) => [f.id, f]) || [])
    const transformedData = data.map((item: any) => ({
      id: item.id,
      standard: item.standard,
      division: item.division,
      faculty_id: item.faculty_id,
      faculty_name: facultyMap.get(item.faculty_id)?.faculty_name || 'Unknown',
      phone_number: facultyMap.get(item.faculty_id)?.phone_number || '',
      subject: item.subject,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))

    console.log('[v0] Faculty fetched for class:', transformedData.length)
    return { success: true, data: transformedData }
  } catch (error) {
    console.error('[v0] Error fetching class faculty:', error)
    return { success: false, error: 'Failed to fetch class faculty' }
  }
}

// Add faculty to class with subject
export async function assignFacultyToClass(data: {
  standard: string
  division: string
  faculty_id: string
  subject: string
}) {
  try {
    console.log('[v0] Assigning faculty to class:', data)
    
    const { data: result, error } = await supabase
      .from('class_faculty_assignments')
      .insert([
        {
          faculty_id: data.faculty_id,
          standard: data.standard,
          division: data.division,
          subject: data.subject,
        }
      ])
      .select()

    if (error) {
      console.error('[v0] Error assigning faculty:', error)
      return { success: false, error: error.message }
    }

    console.log('[v0] Faculty assigned successfully')
    return { success: true, data: result }
  } catch (error) {
    console.error('[v0] Error assigning faculty:', error)
    return { success: false, error: 'Failed to assign faculty' }
  }
}

// Remove faculty from class
export async function removeFacultyFromClass(assignmentId: string) {
  try {
    console.log('[v0] Removing faculty assignment:', assignmentId)
    
    const { error } = await supabase
      .from('class_faculty_assignments')
      .delete()
      .eq('id', assignmentId)

    if (error) {
      console.error('[v0] Error removing faculty:', error)
      return { success: false, error: error.message }
    }

    console.log('[v0] Faculty removed successfully')
    return { success: true }
  } catch (error) {
    console.error('[v0] Error removing faculty:', error)
    return { success: false, error: 'Failed to remove faculty' }
  }
}

// Get all faculty for assignment dropdown
export async function getAllFacultyForAssignment() {
  try {
    console.log('[v0] Fetching all faculty for assignment')
    
    const { data, error } = await supabase
      .from('faculty')
      .select('id, faculty_name, phone_number')
      .order('faculty_name', { ascending: true })

    if (error) {
      console.error('[v0] Error fetching faculty:', error)
      return { success: false, error: error.message }
    }

    console.log('[v0] Faculty fetched:', data?.length || 0)
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error fetching faculty:', error)
    return { success: false, error: 'Failed to fetch faculty' }
  }
}

// Update faculty assignment (change subject)
export async function updateFacultyAssignment(
  assignmentId: string,
  updates: { subject: string }
) {
  try {
    console.log('[v0] Updating faculty assignment:', assignmentId, updates)
    
    const { data, error } = await supabase
      .from('class_faculty_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()

    if (error) {
      console.error('[v0] Error updating assignment:', error)
      return { success: false, error: error.message }
    }

    console.log('[v0] Faculty assignment updated successfully')
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error updating assignment:', error)
    return { success: false, error: 'Failed to update assignment' }
  }
}
