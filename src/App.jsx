import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import Column from './components/Column'
import TaskCard from './components/TaskCard'
import AddTaskModal from './components/AddTaskModal'

const COLUMNS = [
  { id: 'todo', title: '📥 To Do', color: 'border-blue-500' },
  { id: 'karim', title: '🔄 Karim', color: 'border-yellow-500' },
  { id: 'klausi', title: '🤖 Klausi', color: 'border-purple-500' },
  { id: 'done', title: '✅ Done', color: 'border-green-500' },
]

const API_URL = '/api/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [activeTask, setActiveTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createTask(taskData) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })
      const newTask = await res.json()
      setTasks([...tasks, newTask])
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  function handleEditTask(task) {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  async function handleSaveTask(taskData) {
    if (taskData.id) {
      // Update existing task
      await updateTask(taskData.id, taskData)
    } else {
      // Create new task
      await createTask(taskData)
    }
    setEditingTask(null)
  }

  async function updateTask(id, updates) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t))
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  async function deleteTask(id) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      setTasks(tasks.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  function handleDragStart(event) {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id
    const overId = over.id

    // Find the column we're dropping into
    let newColumn = overId
    
    // If we're dropping over a task, find its column
    const overTask = tasks.find(t => t.id === overId)
    if (overTask) {
      newColumn = overTask.column
    }

    // Only update if it's a valid column
    if (COLUMNS.some(c => c.id === newColumn)) {
      const task = tasks.find(t => t.id === taskId)
      if (task && task.column !== newColumn) {
        updateTask(taskId, { column: newColumn })
      }
    }
  }

  function getTasksByColumn(columnId) {
    return tasks.filter(t => t.column === columnId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">📋 Kanban Board</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + Neuer Task
        </button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map(column => (
            <Column
              key={column.id}
              column={column}
              tasks={getTasksByColumn(column.id)}
              onDeleteTask={deleteTask}
              onEditTask={handleEditTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSubmit={handleSaveTask}
        editTask={editingTask}
      />
    </div>
  )
}

export default App
