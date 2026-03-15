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

interface Notice {
  id: string
  created_by: string
  title: string
  content: string
  notice_type: 'general' | 'academic' | 'event' | 'emergency'
  priority: 'low' | 'normal' | 'high'
  is_published: boolean
  published_date: string
  created_at: string
}

interface CreateNoticeData {
  created_by: string
  title: string
  content: string
  notice_type?: 'general' | 'academic' | 'event' | 'emergency'
  priority?: 'low' | 'normal' | 'high'
}

export async function createNotice(data: CreateNoticeData): Promise<{
  success: boolean
  data?: Notice
  error?: string
}> {
  try {
    const { data: notice, error } = await supabase
      .from('notices')
      .insert({
        ...data,
        notice_type: data.notice_type || 'general',
        priority: data.priority || 'normal',
        is_published: true,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: notice }
  } catch (error) {
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

    return { success: true, data: notices }
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

    return { success: true, data: notices }
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
    // Check if user is admin or faculty
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

    return { success: true, data: notices }
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
      .update(updates)
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
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', noticeId)

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
