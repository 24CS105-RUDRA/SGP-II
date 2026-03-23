'use server'

import { createClient } from '@/lib/supabase'

const supabase = createClient()

interface TimetableEntry {
  id: string
  faculty_id: string
  standard: string
  division?: string
  subject: string
  day_of_week: string
  time_slot: string
  classroom?: string
}

interface CreateTimetableData {
  faculty_id: string
  standard: string
  division?: string
  subject: string
  day_of_week: string
  time_slot: string
  classroom?: string
}

export async function createTimetableEntry(data: CreateTimetableData): Promise<{
  success: boolean
  data?: TimetableEntry
  error?: string
}> {
  try {
    const { data: entry, error } = await supabase
      .from('timetable')
      .insert(data)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: entry }
  } catch (error) {
    return { success: false, error: 'Failed to create timetable entry' }
  }
}

export async function getTimetableByClass(
  standard: string,
  division?: string
): Promise<{
  success: boolean
  data?: TimetableEntry[]
  error?: string
}> {
  try {
    let query = supabase
      .from('timetable')
      .select('*')
      .eq('standard', standard)

    if (division) {
      query = query.eq('division', division)
    }

    const { data: entries, error } = await query.order('day_of_week').order('time_slot')

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: entries }
  } catch (error) {
    return { success: false, error: 'Failed to fetch timetable' }
  }
}

export async function getTimetableByFaculty(facultyId: string): Promise<{
  success: boolean
  data?: TimetableEntry[]
  error?: string
}> {
  try {
    const { data: entries, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('faculty_id', facultyId)
      .order('day_of_week')
      .order('time_slot')

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: entries }
  } catch (error) {
    return { success: false, error: 'Failed to fetch timetable' }
  }
}

export async function updateTimetableEntry(
  entryId: string,
  updates: Partial<CreateTimetableData>
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('timetable')
      .update(updates)
      .eq('id', entryId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update timetable entry' }
  }
}

export async function deleteTimetableEntry(entryId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('id', entryId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete timetable entry' }
  }
}
