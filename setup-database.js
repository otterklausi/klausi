import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gmijmhmwixdjhtzdbrwb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtaWptaG13aXhkamh0emRicndiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ0Mjk0NywiZXhwIjoyMDg1MDE4OTQ3fQ.-aKg1hk6KCs0rRZJXIALhE01CPCjHcxaXuhd5I2yOIg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setup() {
  console.log('🦦 Setting up Supabase database...\n')
  
  // Insert tasks (if table doesn't exist, this will fail)
  const tasks = [
    { id: 'task-1', title: 'Papaprotect Deep Dive', description: '', priority: 'normal', column: 'todo', created_at: '2025-01-21T10:00:00.000Z' },
    { id: 'task-2', title: 'GEZ abmelden', description: '', priority: 'normal', deadline: '2026-01-27', column: 'todo', created_at: '2025-01-21T10:00:00.000Z' },
    { id: 'task-3', title: '✅ Dogcare Posts fertig (5x)', description: 'Australian Shepherd, Rottweiler, Knochenbruch, Arthrose, Epilepsie', priority: 'normal', column: 'done', created_at: '2025-01-21T10:00:00.000Z' },
    { id: 'task-4', title: 'Angebot Policentransfer', description: '', priority: 'normal', column: 'todo', created_at: '2025-01-21T10:00:00.000Z' },
    { id: 'task-5', title: 'ACC Website Livegang', description: '', priority: 'normal', deadline: '2026-01-30', column: 'todo', created_at: '2025-01-21T10:00:00.000Z' },
    { id: 'task-6', title: 'Dogcare Posts - Batch 2 (7x offen)', description: 'Patellaluxation, CT, Herzkrankheiten, Narkose, Fremdkörper, Lahmheit, Bauchoperation', priority: 'normal', column: 'todo', created_at: '2026-01-26T15:45:00.000Z' }
  ]
  
  console.log('Checking if table exists...')
  const { data: existing, error: checkError } = await supabase
    .from('tasks')
    .select('id')
    .limit(1)
  
  if (checkError && checkError.code === '42P01') {
    console.log('\n❌ Table "tasks" does not exist!')
    console.log('\n📋 Please run this SQL in Supabase SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/gmijmhmwixdjhtzdbrwb/sql/new\n')
    console.log('────────────────────────────────────────────────────────────')
    console.log(`
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal',
  deadline DATE,
  column TEXT NOT NULL DEFAULT 'todo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON tasks FOR ALL USING (true) WITH CHECK (true);
`)
    console.log('────────────────────────────────────────────────────────────')
    process.exit(1)
  }
  
  console.log('✓ Table exists!\n')
  console.log('Inserting tasks...')
  
  for (const task of tasks) {
    const { error: insertError } = await supabase
      .from('tasks')
      .upsert(task, { onConflict: 'id' })
    
    if (insertError) {
      console.log(`  ✗ ${task.title}: ${insertError.message}`)
    } else {
      console.log(`  ✓ ${task.title}`)
    }
  }
  
  console.log('\n✅ Database setup complete!')
}

setup().catch(console.error)
