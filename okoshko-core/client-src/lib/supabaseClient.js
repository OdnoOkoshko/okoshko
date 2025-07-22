import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tymxhehacbcyegjijibo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bXhoZWhhY2JjeWVnamlqaWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NTgyMDksImV4cCI6MjA2NzUzNDIwOX0.BwyWRZbqSHN-XK4RacwUkvpHh_6CpPL3rQsZE3p5CL8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)