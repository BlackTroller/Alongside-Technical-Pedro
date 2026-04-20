import { createBrowserClient as createBrowserClientSupabase } from '@supabase/ssr'

export function createBrowserClient() {
  return createBrowserClientSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}