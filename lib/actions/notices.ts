'use server'

import { createClient } from '@/lib/supabase'
import type { Notice } from '@/types'

const supabase = createClient()

interface CreateNoticeData {
  created_by: string
  title: string
  content: string
  notice_type?: 'general' | 'academic' | 'event' | 'urgent'
  priority?: 'low' | 'medium' | 'high'
}

export async function createNotice(data: CreateNoticeData): Promise<{
  success: boolean
  data?: Notice
  error?: string
}> {
  try {
    const now = new Date().toISOString()
    const { data: notice, error } = await supabase
      .from('notices')
      .insert({
        created_by: data.created_by,
        title: data.title,
        content: data.content,
        notice_type: data.notice_type || 'general',
        priority: data.priority || 'medium',
        is_published: true,
        published_date: now,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Create notice error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: notice as Notice }
  } catch (error) {
    console.error('[v0] Create notice exception:', error)
    return { success: false, error: 'Failed to create notice' }
  }
}

export async function getPublishedNotices(): Promise<{
  success: boolean
  data?: Notice[]
  error?: string
}> {
  try {
    const { data: notices, error } = await supabase
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .order('published_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: notices as Notice[] }
  } catch (error) {
    return { success: false, error: 'Failed to fetch notices' }
  }
}

export async function getNoticesByType(noticeType: string): Promise<{
  success: boolean
  data?: Notice[]
  error?: string
}> {
  try {
    const { data: notices, error } = await supabase
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .eq('notice_type', noticeType)
      .order('published_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: notices as Notice[] }
  } catch (error) {
    return { success: false, error: 'Failed to fetch notices' }
  }
}

export async function getAllNotices(userId: string): Promise<{
  success: boolean
  data?: Notice[]
  error?: string
}> {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !user || !['admin', 'faculty'].includes(user.role)) {
      return { success: false, error: 'Unauthorized' }
    }

    const { data: notices, error } = await supabase
      .from('notices')
      .select('*')
      .order('published_date', { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: notices as Notice[] }
  } catch (error) {
    return { success: false, error: 'Failed to fetch notices' }
  }
}

export async function updateNotice(
  noticeId: string,
  updates: Partial<CreateNoticeData>
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('notices')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noticeId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update notice' }
  }
}

export async function deleteNotice(noticeId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase.from('notices').delete().eq('id', noticeId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete notice' }
  }
}

export async function publishNotice(noticeId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('notices')
      .update({
        is_published: true,
        published_date: new Date().toISOString(),
      })
      .eq('id', noticeId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to publish notice' }
  }
}
