import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import Column from './components/Column'
import TaskCard from './components/TaskCard'
import AddTaskModal from './components/AddTaskModal'
import StatusPanel from './components/StatusPanel'
import ActivityLog from './components/ActivityLog'
import NotesPanel from './components/NotesPanel'
import DeliverablesTab from './components/DeliverablesTab'
import { supabase } from './supabaseClient'

const COLUMNS = [
  { id: 'todo', title: '📥 To Do', color: 'border-blue-500' },
  { id: 'karim', title: '🔄 Karim', color: 'border-yellow-500' },
  { id: 'klausi', title: '🤖 Klausi', color: 'border-purple-500' },
  { id: 'done', title: '✅ Done', color: 'border-green-500' },
]

const TABS = [
  { id: 'kanban', title: '📋 Kanban' },
  { id: 'dashboard', title: '📊 Dashboard' },
  { id: 'notes', title: '📝 Notizen' },
  { id: 'deliverables', title: '📁 Deliverables' },
]

function App() {
  const [tasks, setTasks] = useState([])
  const [activeTask, setActiveTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('kanban')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchTasks()
    
    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Change received!', payload)
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      const tasksWithColumn = data.map(t => ({ ...t, column: t.status }))
      setTasks(tasksWithColumn)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createTask(taskData) {
    try {
      const now = new Date().toISOString()
      const newTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: taskData.title,
        description: taskData.description || null,
        status: taskData.column || 'todo',
        priority: taskData.priority || 'normal',
        deadline: taskData.deadline || null,
        created_at: now,
        updated_at: now,
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        alert(`Fehler beim Erstellen: ${error.message}`)
        throw error
      }
      
      await fetchTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
      alert(`Task konnte nicht erstellt werden: ${error.message}`)
    }
  }

  function handleEditTask(task) {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  async function handleSaveTask(taskData) {
    if (taskData.id) {
      await updateTask(taskData.id, taskData)
    } else {
      await createTask(taskData)
    }
    setEditingTask(null)
  }

  async function updateTask(id, updates) {
    try {
      const supabaseUpdate = { ...updates }
      if (updates.column) {
        supabaseUpdate.status = updates.column
        delete supabaseUpdate.column
      }
      supabaseUpdate.updated_at = new Date().toISOString()
      
      const { error } = await supabase
        .from('tasks')
        .update(supabaseUpdate)
        .eq('id', id)
      
      if (error) throw error
      
      await fetchTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  async function deleteTask(id) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
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

    let newColumn = overId
    
    const overTask = tasks.find(t => t.id === overId)
    if (overTask) {
      newColumn = overTask.column
    }

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
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">🦦 OtterKlausi Dashboard</h1>
          {activeTab === 'kanban' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              + Neuer Task
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <nav className="flex gap-1 mt-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'kanban' && (
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
        )}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StatusPanel />
              <div className="bg-[#1a1a1a] rounded-lg p-4">
                <h2 className="text-lg font-semibold text-white mb-4">📈 Übersicht</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#2a2a2a] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {tasks.filter(t => t.column === 'todo').length}
                    </div>
                    <div className="text-sm text-gray-400">To Do</div>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {tasks.filter(t => t.column === 'karim').length}
                    </div>
                    <div className="text-sm text-gray-400">Karim</div>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {tasks.filter(t => t.column === 'klausi').length}
                    </div>
                    <div className="text-sm text-gray-400">Klausi</div>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {tasks.filter(t => t.column === 'done').length}
                    </div>
                    <div className="text-sm text-gray-400">Done</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <ActivityLog />
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="max-w-2xl mx-auto">
            <NotesPanel />
          </div>
        )}

        {activeTab === 'deliverables' && (
          <div className="max-w-2xl mx-auto">
            <DeliverablesTab />
          </div>
        )}
      </main>

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
