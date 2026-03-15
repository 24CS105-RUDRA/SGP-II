'use server'

import { supabaseAdmin } from '@/lib/supabase'

interface CreateMaterialInput {
  faculty_id: string
  title: string
  description: string
  subject: string
  standard: string
  file_url: string
  file_type: string
  uploaded_date: string
  is_downloadable: boolean
  folder_id?: string
}

export async function createStudyMaterial(input: CreateMaterialInput) {
  try {
    const { data, error } = await supabaseAdmin.from('study_materials').insert([
      {
        faculty_id: input.faculty_id,
        title: input.title,
        description: input.description,
        subject: input.subject,
        standard: input.standard,
        file_url: input.file_url,
        file_type: input.file_type,
        uploaded_date: input.uploaded_date,
        is_downloadable: input.is_downloadable,
        folder_id: input.folder_id || null,
      },
    ])

    if (error) {
      console.error('[v0] Study materials creation error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Study materials creation error:', error)
    return { success: false, error: String(error) }
  }
}

export async function getStudyMaterialsByStudent(standard: string, subject?: string) {
  try {
    let query = supabaseAdmin
      .from('study_materials')
      .select('*')
      .eq('standard', standard)

    if (subject) {
      query = query.eq('subject', subject)
    }

    const { data, error } = await query.order('uploaded_date', { ascending: false })

    if (error) {
      console.error('[v0] Get materials error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Get materials error:', error)
    return { success: false, error: String(error) }
  }
}

export async function getStudyMaterialsByFaculty(faculty_id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('study_materials')
      .select('*')
      .eq('faculty_id', faculty_id)
      .order('uploaded_date', { ascending: false })

    if (error) {
      console.error('[v0] Get faculty materials error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('[v0] Get faculty materials error:', error)
    return { success: false, error: String(error) }
  }
}

export async function deleteStudyMaterial(id: string, file_url?: string) {
  try {
    // First delete the file from Vercel Blob if URL is provided
    if (file_url) {
      try {
        await fetch('/api/delete-material', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: file_url }),
        })
      } catch (error) {
        console.error('[v0] Error deleting blob file:', error)
        // Continue with database deletion even if blob deletion fails
      }
    }

    // Then delete the database record
    const { error } = await supabaseAdmin.from('study_materials').delete().eq('id', id)

    if (error) {
      console.error('[v0] Delete material error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Delete material error:', error)
    return { success: false, error: String(error) }
  }
}
