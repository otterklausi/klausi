#!/usr/bin/env node
/**
 * Kanban Task Processor for Klausi
 * 
 * Checks Supabase for tasks assigned to "klausi" column
 * Processes them automatically and updates status
 * 
 * Usage:
 *   node kanban-task-processor.js [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmijmhmwixdjhtzdbrwb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtaWptaG13aXhkamh0emRicndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDI5NDcsImV4cCI6MjA4NTAxODk0N30.ncbD1n26AP1TBVoEz9h6X7KBYYmaFP2Q-Ii08LmYU3Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Get all tasks assigned to Klausi
 */
async function getKlausiTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'klausi')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching tasks:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Update task status
 */
async function updateTaskStatus(taskId, newStatus, notes = '') {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would update task ${taskId} to ${newStatus}`);
    return { success: true };
  }
  
  const updateData = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };
  
  if (notes) {
    updateData.description = `${notes}\n\n---\n${updateData.description || ''}`;
  }
  
  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId);
  
  if (error) {
    console.error(`❌ Error updating task ${taskId}:`, error);
    return { success: false, error };
  }
  
  return { success: true };
}

/**
 * Process a single task based on type/title
 */
async function processTask(task) {
  console.log(`\n🦦 Processing: ${task.title}`);
  console.log(`   Priority: ${task.priority || 'medium'}`);
  console.log(`   Description: ${task.description || '(none)'}`);
  
  const title = task.title.toLowerCase();
  const description = (task.description || '').toLowerCase();
  
  // Detect task type
  let taskType = 'unknown';
  let actionNeeded = '';
  
  if (title.includes('blog') || title.includes('artikel') || description.includes('blog')) {
    taskType = 'blogpost';
    actionNeeded = 'Blogbeitrag schreiben mit SEO Writer Skill';
  } else if (title.includes('research') || title.includes('recherche')) {
    taskType = 'research';
    actionNeeded = 'Web-Research durchführen';
  } else if (title.includes('seo') || title.includes('keyword')) {
    taskType = 'seo';
    actionNeeded = 'SEO-Analyse durchführen';
  } else if (title.includes('notion') || title.includes('import')) {
    taskType = 'notion';
    actionNeeded = 'Notion Import/Export';
  } else if (title.includes('code') || title.includes('script')) {
    taskType = 'coding';
    actionNeeded = 'Code schreiben/anpassen';
  } else {
    taskType = 'general';
    actionNeeded = 'Allgemeine Aufgabe prüfen';
  }
  
  console.log(`   Type: ${taskType}`);
  console.log(`   Action: ${actionNeeded}`);
  
  // For now, move to "karim" for approval with notes
  // Later we can add auto-processing for simple tasks
  const notes = `🦦 Klausi hat Task analysiert:\n- Typ: ${taskType}\n- Nächster Schritt: ${actionNeeded}\n- Status: Warte auf Details/Approval`;
  
  await updateTaskStatus(task.id, 'karim', notes);
  
  return {
    taskId: task.id,
    title: task.title,
    type: taskType,
    action: actionNeeded,
    status: 'moved_to_karim_for_approval'
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🦦 Klausi Task Processor');
  console.log('========================\n');
  
  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }
  
  // Get tasks
  const tasks = await getKlausiTasks();
  
  if (tasks.length === 0) {
    console.log('✅ No tasks in Klausi column - all clear!');
    return;
  }
  
  console.log(`📋 Found ${tasks.length} task(s) for Klausi:\n`);
  
  // Process each task
  const results = [];
  for (const task of tasks) {
    try {
      const result = await processTask(task);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error processing task ${task.id}:`, error);
      results.push({
        taskId: task.id,
        title: task.title,
        error: error.message,
        status: 'failed'
      });
    }
  }
  
  // Summary
  console.log('\n\n📊 Summary');
  console.log('==========');
  console.log(`Total tasks: ${tasks.length}`);
  console.log(`Processed: ${results.filter(r => r.status !== 'failed').length}`);
  console.log(`Failed: ${results.filter(r => r.status === 'failed').length}`);
  
  if (results.length > 0) {
    console.log('\nResults:');
    results.forEach(r => {
      console.log(`  - ${r.title}: ${r.status}`);
    });
  }
}

// Run
main().catch(console.error);
