'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface GalleryImage {
  id: string
  title: string
  description?: string
  image_url: string
  category: string
  uploaded_by: string
  uploaded_date: string
}

interface CreateGalleryData {
  title: string
  description?: string
  image_url: string
  category: string
  uploaded_by: string
}

export async function uploadGalleryImage(data: CreateGalleryData): Promise<{
  success: boolean
  data?: GalleryImage
  error?: string
}> {
  try {
    const { data: image, error } = await supabase
      .from('gallery')
      .insert({
        ...data,
        uploaded_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: image }
  } catch (error) {
    return { success: false, error: 'Failed to upload gallery image' }
  }
}

export async function getGalleryByCategory(category: string): Promise<{
  success: boolean
  data?: GalleryImage[]
  error?: string
}> {
  try {
    const { data: images, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('category', category)
      .order('uploaded_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: images }
  } catch (error) {
    return { success: false, error: 'Failed to fetch gallery' }
  }
}

export async function getAllGallery(): Promise<{
  success: boolean
  data?: GalleryImage[]
  error?: string
}> {
  try {
    const { data: images, error } = await supabase
      .from('gallery')
      .select('*')
      .order('uploaded_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: images }
  } catch (error) {
    return { success: false, error: 'Failed to fetch gallery' }
  }
}

export async function deleteGalleryImage(imageId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('gallery')
      .delete()
      .eq('id', imageId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete gallery image' }
  }
}

export async function getStudyMaterials(facultyId?: string): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    let query = supabase.from('study_materials').select('*')

    if (facultyId) {
      query = query.eq('faculty_id', facultyId)
    }

    const { data: materials, error } = await query.order('uploaded_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: materials }
  } catch (error) {
    return { success: false, error: 'Failed to fetch study materials' }
  }
}

export async function uploadStudyMaterial(data: {
  faculty_id: string
  title: string
  description?: string
  subject: string
  standard: string
  file_url: string
  file_type: string
}): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    const { data: material, error } = await supabase
      .from('study_materials')
      .insert({
        ...data,
        uploaded_date: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: material }
  } catch (error) {
    return { success: false, error: 'Failed to upload study material' }
  }
}

export async function deleteStudyMaterial(materialId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', materialId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete study material' }
  }
}
