'use server'

import { uploadImage, uploadDocument, deleteFile, type UploadResult } from '@/lib/cloudinary'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

export async function uploadGalleryImage(
  file: File,
  eventId: string
): Promise<UploadResult & { imageId?: string }> {
  try {
    const result = await uploadImage(file, `school/gallery/${eventId}`)
    
    if (!result.success) {
      return result
    }

    const { data: image, error } = await supabase
      .from('gallery_images')
      .insert({
        event_id: eventId,
        image_url: result.url,
        caption: file.name.split('.')[0],
      })
      .select()
      .single()

    if (error) {
      await deleteFile(result.publicId!)
      return { success: false, error: 'Failed to save image to database' }
    }

    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
      imageId: image.id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

export async function uploadStudyMaterial(
  file: File,
  facultyId: string,
  metadata: {
    title: string
    description?: string
    standard?: string
    division?: string
    subject?: string
    folderId?: string
  }
): Promise<UploadResult & { materialId?: string }> {
  try {
    const folder = metadata.standard && metadata.division
      ? `school/materials/${metadata.standard}-${metadata.division}`
      : 'school/materials'
    
    const result = await uploadDocument(file, folder)

    if (!result.success) {
      return result
    }

    const { data: material, error } = await supabase
      .from('study_materials')
      .insert({
        faculty_id: facultyId,
        title: metadata.title,
        description: metadata.description || null,
        file_url: result.url,
        folder_id: metadata.folderId || null,
        standard: metadata.standard || null,
        division: metadata.division || null,
        subject: metadata.subject || null,
      })
      .select()
      .single()

    if (error) {
      await deleteFile(result.publicId!)
      return { success: false, error: 'Failed to save material to database' }
    }

    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
      materialId: material.id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

export async function deleteGalleryImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: image, error: fetchError } = await supabase
      .from('gallery_images')
      .select('id, image_url')
      .eq('id', imageId)
      .single()

    if (fetchError || !image) {
      return { success: false, error: 'Image not found' }
    }

    const urlParts = image.image_url.split('/')
    const publicIdWithFolder = urlParts.slice(urlParts.indexOf('school')).join('.').split('.')[0]
    const publicId = publicIdWithFolder.replace(/\.[^.]+$/, '')

    if (publicId) {
      await deleteFile(publicId)
    }

    const { error } = await supabase.from('gallery_images').delete().eq('id', imageId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

export async function deleteStudyMaterial(materialId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: material, error: fetchError } = await supabase
      .from('study_materials')
      .select('id, file_url')
      .eq('id', materialId)
      .single()

    if (fetchError || !material) {
      return { success: false, error: 'Material not found' }
    }

    const urlParts = material.file_url.split('/')
    const publicIdWithFolder = urlParts.slice(urlParts.indexOf('school')).join('.').split('.')[0]
    const publicId = publicIdWithFolder.replace(/\.[^.]+$/, '')

    if (publicId) {
      await deleteFile(publicId)
    }

    const { error } = await supabase.from('study_materials').delete().eq('id', materialId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}
