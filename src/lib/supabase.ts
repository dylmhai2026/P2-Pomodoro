import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Helper to validate URL to prevent crash
const isValidUrl = (urlString: string) => {
  try {
    return Boolean(new URL(urlString))
  } catch(e){
    return false
  }
}

const url = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder'

if (!isValidUrl(supabaseUrl)) {
  console.error('Invalid or missing VITE_SUPABASE_URL. Please check your .env.local file.')
}

export const supabase = createClient(url, key)
