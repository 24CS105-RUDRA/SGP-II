'use server'

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable.')
}

if (!supabaseServiceKey) {
  throw new Error('Supabase key is required. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

type ManagedRole = 'student' | 'faculty'

interface ManagedUser {
  id: string
  name: string
  username: string
  email: string
  role: ManagedRole
  lastChanged: string
}

function normalizeDate(value?: string | null): string {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Never'
  return date.toLocaleDateString('en-IN')
}

function validatePassword(password: string): string | null {
  if (!password || password.trim().length === 0) {
    return 'Password is required'
  }

  return null
}

export async function getPasswordManagedUsers(
  role: ManagedRole
): Promise<{ success: boolean; data?: ManagedUser[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, username, email, role, updated_at')
      .eq('role', role)
      .order('full_name', { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    const users: ManagedUser[] =
      data?.map((user: any) => ({
        id: user.id,
        name: user.full_name || 'N/A',
        username: user.username || 'N/A',
        email: user.email || 'N/A',
        role: user.role,
        lastChanged: normalizeDate(user.updated_at),
      })) || []

    return { success: true, data: users }
  } catch (error) {
    return { success: false, error: 'Failed to fetch users' }
  }
}

export async function resetSingleUserPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const validationError = validatePassword(newPassword)
    if (validationError) {
      return { success: false, error: validationError }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to reset password' }
  }
}

export async function resetPasswordsByRole(
  role: ManagedRole,
  newPassword: string
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  try {
    const validationError = validatePassword(newPassword)
    if (validationError) {
      return { success: false, error: validationError }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('role', role)
      .select('id')

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, updatedCount: data?.length || 0 }
  } catch (error) {
    return { success: false, error: 'Failed to reset passwords' }
  }
}
