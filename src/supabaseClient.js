import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gmijmhmwixdjhtzdbrwb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtaWptaG13aXhkamh0emRicndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDI5NDcsImV4cCI6MjA4NTAxODk0N30.ncbD1n26AP1TBVoEz9h6X7KBYYmaFP2Q-Ii08LmYU3Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
