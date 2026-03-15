'use server'

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable.')
}

if (!supabaseServiceKey) {
  throw new Error('Supabase key is required. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface LoginCredentials {
  username: string
  password: string
  role: 'student' | 'faculty' | 'admin'
}

interface LoginResponse {
  success: boolean
  data?: {
    id: string
    username: string
    full_name: string
    email: string
    role: string
    year_of_study?: string
    division?: string
    standard?: string
  }
  error?: string
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const { username, password, role } = credentials

    console.log('[v0] Auth: Querying user with username:', username, 'role:', role)

    // Query user from database using maybeSingle to handle no rows case
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('role', role)
      .maybeSingle()

    console.log('[v0] Auth: Query result - user found:', !!user, 'error:', userError)

    if (userError) {
      console.error('[v0] Database error:', userError)
      return {
        success: false,
        error: 'Login failed. Please try again.',
      }
    }

    if (!user) {
      console.log('[v0] Auth: No user found with username:', username, 'and role:', role)
      return {
        success: false,
        error: 'Invalid username or password',
      }
    }

    // Verify password
    console.log('[v0] Auth: Verifying password for user:', username)
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    console.log('[v0] Auth: Password match result:', passwordMatch)

    if (!passwordMatch) {
      return {
        success: false,
        error: 'Invalid username or password',
      }
    }

    console.log('[v0] Auth: Login successful for user:', username)

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        year_of_study: user.year_of_study,
        division: user.division,
        standard: user.standard,
      },
    }
  } catch (error) {
    console.error('[v0] Login error:', error)
    return {
      success: false,
      error: 'Login failed. Please try again.',
    }
  }
}

export async function registerUser(userData: {
  username: string
  password: string
  full_name: string
  email: string
  role: 'student' | 'faculty'
  year_of_study?: string
  division?: string
  standard?: string
}): Promise<LoginResponse> {
  try {
    const passwordHash = await bcrypt.hash(userData.password, 10)

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username: userData.username,
        password_hash: passwordHash,
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role,
        year_of_study: userData.year_of_study,
        division: userData.division,
        standard: userData.standard,
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        year_of_study: user.year_of_study,
        division: user.division,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: 'Registration failed. Please try again.',
    }
  }
}

export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .maybeSingle()

    if (userError || !user) {
      return { success: false, error: 'User not found' }
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash)
    if (!passwordMatch) {
      return { success: false, error: 'Current password is incorrect' }
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Password change failed' }
  }
}

export async function seedDemoUsers(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if admin user already exists
    const { data: adminUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .eq('role', 'admin')
      .maybeSingle()

    if (adminUser) {
      return { success: true, message: 'Admin user already exists' }
    }

    // Create admin user only
    const adminPassword = await bcrypt.hash('admin123', 10)

    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert({
        username: 'admin',
        password_hash: adminPassword,
        full_name: 'Administrator',
        email: 'admin@school.com',
        role: 'admin',
        year_of_study: null,
        division: null,
        standard: null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[v0] Seed error:', insertError)
      return { success: false, message: `Failed to seed admin user: ${insertError.message}` }
    }

    return { success: true, message: 'Admin user created successfully' }
  } catch (error) {
    console.error('[v0] Seed function error:', error)
    return { success: false, message: 'Failed to seed admin user' }
  }
}
