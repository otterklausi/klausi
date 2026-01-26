import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, '..', 'data', 'tasks.json');

const app = express();
app.use(cors());
app.use(express.json());

// Helper functions
function readTasks() {
  if (!existsSync(DATA_FILE)) {
    return { tasks: [] };
  }
  const data = readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeTasks(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all tasks
app.get('/api/tasks', (req, res) => {
  try {
    const data = readTasks();
    res.json(data.tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// POST create task
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description = '', priority = 'normal', deadline = null, column = 'todo' } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const data = readTasks();
    const newTask = {
      id: `task-${uuidv4()}`,
      title,
      description,
      priority,
      deadline,
      column,
      createdAt: new Date().toISOString()
    };
    
    data.tasks.push(newTask);
    writeTasks(data);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const data = readTasks();
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    data.tasks[taskIndex] = { ...data.tasks[taskIndex], ...updates };
    writeTasks(data);
    res.json(data.tasks[taskIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = readTasks();
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    data.tasks.splice(taskIndex, 1);
    writeTasks(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

const PORT = 3457;
app.listen(PORT, () => {
  console.log(`🚀 Kanban API running on http://localhost:${PORT}`);
});
