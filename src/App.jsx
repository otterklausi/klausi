import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import {
  LayoutDashboard,
  Kanban,
  StickyNote,
  FolderOpen,
  Sun,
  Moon,
  Command,
  Search,
  Plus,
  Menu,
  X,
  ChevronRight,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import Column from './components/Column'
import TaskCard from './components/TaskCard'
import AddTaskModal from './components/AddTaskModal'
import StatusPanel from './components/StatusPanel'
import ActivityLog from './components/ActivityLog'
import NotesPanel from './components/NotesPanel'
import DeliverablesTab from './components/DeliverablesTab'
import CommandPalette from './components/CommandPalette'
import { supabase } from './supabaseClient'

const COLUMNS = [
  { id: 'todo', title: 'To Do', icon: Clock, color: 'bg-blue-500' },
  { id: 'karim', title: 'Karim', icon: AlertCircle, color: 'bg-yellow-500' },
  { id: 'klausi', title: 'Klausi', icon: Activity, color: 'bg-purple-500' },
  { id: 'done', title: 'Done', icon: CheckCircle2, color: 'bg-green-500' },
]

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'notes', label: 'Notizen', icon: StickyNote },
  { id: 'deliverables', label: 'Deliverables', icon: FolderOpen },
]

function App() {
  const [tasks, setTasks] = useState([])
  const [activeTask, setActiveTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isDark, setIsDark] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandOpen(true)
      }
      if (e.key === 'Escape') {
        setCommandOpen(false)
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fetch tasks
  useEffect(() => {
    fetchTasks()
    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchTasks())
      .subscribe()
    return () => subscription.unsubscribe()
  }, [])

  async function fetchTasks() {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: true })
      if (error) throw error
      setTasks(data?.map(t => ({ ...t, column: t.status })) || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      toast.error('Fehler beim Laden der Tasks')
    } finally {
      setLoading(false)
    }
  }

  async function createTask(taskData) {
    try {
      const newTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: taskData.title,
        description: taskData.description || null,
        status: taskData.column || 'todo',
        priority: taskData.priority || 'normal',
        deadline: taskData.deadline || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('tasks').insert(newTask)
      if (error) throw error
      toast.success('Task erstellt!')
      await fetchTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Fehler beim Erstellen')
    }
  }

  async function updateTask(id, updates) {
    try {
      const supabaseUpdate = { ...updates }
      if (updates.column) {
        supabaseUpdate.status = updates.column
        delete supabaseUpdate.column
      }
      supabaseUpdate.updated_at = new Date().toISOString()
      const { error } = await supabase.from('tasks').update(supabaseUpdate).eq('id', id)
      if (error) throw error
      await fetchTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  async function deleteTask(id) {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      setTasks(tasks.filter(t => t.id !== id))
      toast.success('Task gelöscht')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Fehler beim Löschen')
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

    let newColumn = over.id
    const overTask = tasks.find(t => t.id === over.id)
    if (overTask) newColumn = overTask.column

    if (COLUMNS.some(c => c.id === newColumn)) {
      const task = tasks.find(t => t.id === active.id)
      if (task && task.column !== newColumn) {
        updateTask(active.id, { column: newColumn })
        toast.success(`Task verschoben nach ${COLUMNS.find(c => c.id === newColumn)?.title}`)
      }
    }
  }

  function getTasksByColumn(columnId) {
    return tasks.filter(t => t.column === columnId)
  }

  const stats = {
    todo: tasks.filter(t => t.column === 'todo').length,
    karim: tasks.filter(t => t.column === 'karim').length,
    klausi: tasks.filter(t => t.column === 'klausi').length,
    done: tasks.filter(t => t.column === 'done').length,
    total: tasks.length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Toaster position="top-right" />
      
      {/* Command Palette */}
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        tasks={tasks}
        onSelectTask={(task) => {
          setActiveTab('kanban')
          setCommandOpen(false)
        }}
      />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop) / Drawer (Mobile) */}
      <motion.aside
        className={`fixed left-0 top-0 h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)] z-50 ${
          isMobile ? 'w-72' : 'w-64'
        }`}
        initial={isMobile ? { x: '-100%' } : false}
        animate={isMobile ? { x: sidebarOpen ? 0 : '-100%' } : { x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center">
              <span className="text-xl">🦦</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg">Klausi</h1>
              <p className="text-xs text-[var(--text-secondary)]">AI Dashboard</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-glow'
                      : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-color)]">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)]"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isMobile ? 'ml-0' : 'ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between px-4 md:px-6 py-4">
            <div className="flex items-center gap-4">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <Menu size={24} />
                </button>
              )}
              <h2 className="font-display font-semibold text-xl">
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Search */}
              <button
                onClick={() => setCommandOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Search size={18} />
                <span className="text-sm">Suchen...</span>
                <kbd className="ml-2 px-2 py-0.5 text-xs rounded bg-[var(--bg-secondary)]">⌘K</kbd>
              </button>

              {/* Add Task */}
              {activeTab === 'kanban' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all shadow-glow hover:shadow-glow-lg"
                >
                  <Plus size={18} />
                  <span className="hidden md:inline">Neuer Task</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-2xl font-display font-bold mb-2">
                  <span className="gradient-text">Guten Tag, Karim!</span> 🦦
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Dein Dashboard ist bereit. {stats.total} Tasks insgesamt, {stats.klausi} bei mir in Arbeit.
                </p>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COLUMNS.map((col, i) => (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setActiveTab('kanban')}
                  >
                    <div className={`w-10 h-10 rounded-lg ${col.color} bg-opacity-20 flex items-center justify-center mb-3`}>
                      <col.icon size={20} className={col.color.replace('bg-', 'text-')} />
                    </div>
                    <div className="text-2xl font-bold">{stats[col.id]}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{col.title}</div>
                  </motion.div>
                ))}
              </div>

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                <StatusPanel />
                <ActivityLog />
              </div>
            </div>
          )}

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
                    onEditTask={(task) => {
                      setEditingTask(task)
                      setIsModalOpen(true)
                    }}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
              </DragOverlay>
            </DndContext>
          )}

          {activeTab === 'notes' && (
            <div className="max-w-2xl mx-auto">
              <NotesPanel />
            </div>
          )}

          {activeTab === 'deliverables' && (
            <div className="max-w-4xl mx-auto">
              <DeliverablesTab />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] z-50">
          <div className="flex justify-around p-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive ? 'text-primary-500' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSubmit={editingTask ? 
          (data) => updateTask(editingTask.id, data).then(() => setEditingTask(null)) : 
          createTask
        }
        editTask={editingTask}
      />
    </div>
  )
}

export default App
