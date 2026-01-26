import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gmijmhmwixdjhtzdbrwb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtaWptaG13aXhkamh0emRicndiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ0Mjk0NywiZXhwIjoyMDg1MDE4OTQ3fQ.-aKg1hk6KCs0rRZJXIALhE01CPCjHcxaXuhd5I2yOIg'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const tasks = [
  { id: 'task-1', title: 'Papaprotect Deep Dive', description: '', priority: 'normal', status: 'todo', created_at: '2025-01-21T10:00:00.000Z' },
  { id: 'task-2', title: 'GEZ abmelden', description: '', priority: 'normal', deadline: '2026-01-27', status: 'todo', created_at: '2025-01-21T10:00:00.000Z' },
  { id: 'task-3', title: '✅ Dogcare Posts fertig (5x)', description: 'Australian Shepherd, Rottweiler, Knochenbruch, Arthrose, Epilepsie', priority: 'normal', status: 'done', created_at: '2025-01-21T10:00:00.000Z' },
  { id: 'task-4', title: 'Angebot Policentransfer', description: '', priority: 'normal', status: 'todo', created_at: '2025-01-21T10:00:00.000Z' },
  { id: 'task-5', title: 'ACC Website Livegang', description: '', priority: 'normal', deadline: '2026-01-30', status: 'todo', created_at: '2025-01-21T10:00:00.000Z' },
  { id: 'task-6', title: 'Dogcare Posts - Batch 2 (7x offen)', description: 'Patellaluxation, CT, Herzkrankheiten, Narkose, Fremdkörper, Lahmheit, Bauchoperation', priority: 'normal', status: 'todo', created_at: '2026-01-26T15:45:00.000Z' }
]

async function insert() {
  console.log('🦦 Inserting tasks into Supabase...\n')
  
  for (const task of tasks) {
    const { error } = await supabase
      .from('tasks')
      .upsert(task, { onConflict: 'id' })
    
    if (error) {
      console.log(`  ✗ ${task.title}: ${error.message}`)
    } else {
      console.log(`  ✓ ${task.title}`)
    }
  }
  
  console.log('\n✅ All tasks inserted!')
}

insert().catch(console.error)
