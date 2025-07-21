import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Настройте переменные VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в секретах проекта')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)