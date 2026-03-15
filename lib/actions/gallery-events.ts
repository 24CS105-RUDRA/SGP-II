'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface GalleryEvent {
  id: string
  event_name: string
  cover_image_url: string
  description?: string
  event_date?: string
  created_by: string
  created_by_role: 'admin' | 'faculty'
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface GalleryImage {
  id: string
  event_id: string
  image_url: string
  image_name: string
  uploaded_at: string
}

// Create gallery event
export async function createGalleryEvent(data: {
  event_name: string
  cover_image_url: string
  description?: string
  event_date?: string
  created_by: string
  created_by_role: 'admin' | 'faculty'
}): Promise<{ success: boolean; data?: GalleryEvent; error?: string }> {
  try {
    const { data: event, error } = await supabase
      .from('gallery_events')
      .insert([
        {
          event_name: data.event_name,
          cover_image_url: data.cover_image_url,
          description: data.description || null,
          event_date: data.event_date || null,
          created_by: data.created_by,
          created_by_role: data.created_by_role,
          is_published: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('[v0] Gallery event creation error:', error)
      return { success: false, error: error.message }
    }

    console.log('[v0] Gallery event created:', event)
    return { success: true, data: event }
  } catch (error) {
    console.error('[v0] Gallery event error:', error)
    return { success: false, error: 'Failed to create gallery event' }
  }
}

// Get all gallery events for admin/faculty
export async function getAllGalleryEvents(): Promise<{
  success: boolean
  data?: GalleryEvent[]
  error?: string
}> {
  try {
    const { data: events, error } = await supabase
      .from('gallery_events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: events }
  } catch (error) {
    console.error('[v0] Error fetching gallery events:', error)
    return { success: false, error: 'Failed to fetch gallery events' }
  }
}

// Get published gallery events for students
export async function getPublishedGalleryEvents(): Promise<{
  success: boolean
  data?: GalleryEvent[]
  error?: string
}> {
  try {
    const { data: events, error } = await supabase
      .from('gallery_events')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: events }
  } catch (error) {
    console.error('[v0] Error fetching published events:', error)
    return { success: false, error: 'Failed to fetch published events' }
  }
}

// Get single event with all images
export async function getGalleryEventWithImages(
  eventId: string
): Promise<{
  success: boolean
  event?: GalleryEvent
  images?: GalleryImage[]
  error?: string
}> {
  try {
    console.log('[v0] getGalleryEventWithImages - Fetching event:', eventId)
    
    const { data: event, error: eventError } = await supabase
      .from('gallery_events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) {
      console.error('[v0] getGalleryEventWithImages - Event fetch error:', eventError)
      return { success: false, error: eventError.message }
    }

    console.log('[v0] getGalleryEventWithImages - Event fetched:', event?.event_name)

    const { data: images, error: imagesError } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('event_id', eventId)
      .order('uploaded_at', { ascending: false })

    if (imagesError) {
      console.error('[v0] getGalleryEventWithImages - Images fetch error:', imagesError)
      return { success: false, error: imagesError.message }
    }

    console.log('[v0] getGalleryEventWithImages - Images fetched count:', images?.length || 0)
    console.log('[v0] getGalleryEventWithImages - Images data:', images)

    return { success: true, event, images }
  } catch (error) {
    console.error('[v0] Error fetching event with images:', error)
    return { success: false, error: 'Failed to fetch event' }
  }
}

// Upload gallery images
export async function uploadGalleryImages(
  eventId: string,
  images: Array<{ url: string; name: string }>
): Promise<{ success: boolean; data?: GalleryImage[]; error?: string }> {
  try {
    const imageRecords = images.map((img) => ({
      event_id: eventId,
      image_url: img.url,
      image_name: img.name,
    }))

    const { data: uploadedImages, error } = await supabase
      .from('gallery_images')
      .insert(imageRecords)
      .select()

    if (error) {
      console.error('[v0] Image upload error:', error)
      return { success: false, error: error.message }
    }

    console.log('[v0] Images uploaded:', uploadedImages)
    return { success: true, data: uploadedImages }
  } catch (error) {
    console.error('[v0] Error uploading images:', error)
    return { success: false, error: 'Failed to upload images' }
  }
}

// Publish gallery event
export async function publishGalleryEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gallery_events')
      .update({ is_published: true })
      .eq('id', eventId)

    if (error) {
      console.error('[v0] Publish error:', error)
      return { success: false, error: error.message }
    }

    console.log('[v0] Gallery event published:', eventId)
    return { success: true }
  } catch (error) {
    console.error('[v0] Error publishing event:', error)
    return { success: false, error: 'Failed to publish event' }
  }
}

// Delete gallery event
export async function deleteGalleryEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete images first
    const { error: imagesError } = await supabase
      .from('gallery_images')
      .delete()
      .eq('event_id', eventId)

    if (imagesError) {
      return { success: false, error: imagesError.message }
    }

    // Then delete event
    const { error: eventError } = await supabase
      .from('gallery_events')
      .delete()
      .eq('id', eventId)

    if (eventError) {
      return { success: false, error: eventError.message }
    }

    console.log('[v0] Gallery event deleted:', eventId)
    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting event:', error)
    return { success: false, error: 'Failed to delete event' }
  }
}

// Delete gallery image
export async function deleteGalleryImage(
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      return { success: false, error: error.message }
    }

    console.log('[v0] Gallery image deleted:', imageId)
    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting image:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}

// Update gallery event
export async function updateGalleryEvent(
  eventId: string,
  data: Partial<GalleryEvent>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gallery_events')
      .update(data)
      .eq('id', eventId)

    if (error) {
      return { success: false, error: error.message }
    }

    console.log('[v0] Gallery event updated:', eventId)
    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating event:', error)
    return { success: false, error: 'Failed to update event' }
  }
}
