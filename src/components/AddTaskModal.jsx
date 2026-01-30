import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, Clock, ArrowDown, Calendar, Check } from 'lucide-react'

const PRIORITIES = [
  { value: 'low', label: 'Niedrig', icon: ArrowDown, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  { value: 'normal', label: 'Normal', icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' },
  { value: 'high', label: 'Hoch', icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30' },
]

const COLUMNS = [
  { value: 'todo', label: 'To Do', color: 'text-blue-400' },
  { value: 'karim', label: 'Karim', color: 'text-yellow-400' },
  { value: 'klausi', label: 'Klausi', color: 'text-purple-400' },
  { value: 'done', label: 'Done', color: 'text-green-400' },
]

export default function AddTaskModal({ isOpen, onClose, onSubmit, editTask }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [deadline, setDeadline] = useState('')
  const [column, setColumn] = useState('todo')

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '')
      setDescription(editTask.description || '')
      setPriority(editTask.priority || 'normal')
      setDeadline(editTask.deadline || '')
      setColumn(editTask.column || 'todo')
    } else {
      setTitle('')
      setDescription('')
      setPriority('normal')
      setDeadline('')
      setColumn('todo')
    }
  }, [editTask, isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      ...(editTask && { id: editTask.id }),
      title: title.trim(),
      description: description.trim(),
      priority,
      deadline: deadline || null,
      column,
    })

    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                <h2 className="font-display font-semibold text-xl">
                  {editTask ? 'Task bearbeiten' : 'Neuer Task'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl px-4 py-3 border border-[var(--border-color)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    placeholder="Was muss erledigt werden?"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl px-4 py-3 border border-[var(--border-color)] focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                    placeholder="Details zur Aufgabe..."
                    rows={3}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Priorität
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRIORITIES.map((p) => {
                      const Icon = p.icon
                      const isSelected = priority === p.value
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                            isSelected
                              ? `${p.bgColor} ${p.borderColor} ${p.color}`
                              : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-sm font-medium">{p.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Column & Deadline */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Spalte
                    </label>
                    <select
                      value={column}
                      onChange={(e) => setColumn(e.target.value)}
                      className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl px-4 py-3 border border-[var(--border-color)] focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Deadline
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl px-4 py-3 border border-[var(--border-color)] focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all font-medium"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim()}
                    className="flex-1 px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-tertiary)] text-white transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    {editTask ? 'Speichern' : 'Erstellen'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
