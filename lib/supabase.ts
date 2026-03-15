import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('supabaseUrl is required. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL environment variable.')
}

if (!supabaseAnonKey) {
  throw new Error('supabaseAnonKey is required. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable.')
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Service role client for server-side operations
export const supabaseAdmin = createSupabaseClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper function to create client instances
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
