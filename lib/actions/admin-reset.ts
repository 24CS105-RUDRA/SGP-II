'use server'

import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function resetAdminUser() {
  try {
    // Generate bcrypt hash for "admin123"
    const passwordHash = await bcrypt.hash('admin123', 10)
    console.log('[v0] Generated password hash for admin')

    // Delete existing admin user if any using admin client
    await supabaseAdmin
      .from('users')
      .delete()
      .eq('username', 'admin')
      .eq('role', 'admin')

    // Create fresh admin user using admin client (bypasses RLS)
    const { data: adminUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        username: 'admin',
        password_hash: passwordHash,
        full_name: 'Administrator',
        email: 'admin@school.com',
        role: 'admin',
        year_of_study: null,
        division: null,
        standard: null,
      })
      .select()
      .single()

    if (createError) {
      console.error('[v0] Error creating admin user:', createError)
      return { success: false, error: createError.message }
    }

    console.log('[v0] Admin user created successfully with ID:', adminUser.id)
    return { success: true, message: 'Admin user reset successfully. Use credentials: admin / admin123' }
  } catch (error) {
    console.error('[v0] Reset admin error:', error)
    return { success: false, error: 'Failed to reset admin user' }
  }
}
