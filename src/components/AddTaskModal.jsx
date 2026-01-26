import { useState, useEffect } from 'react'

function AddTaskModal({ isOpen, onClose, onSubmit, editTask }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [deadline, setDeadline] = useState('')
  const [column, setColumn] = useState('todo')

  // Populate form when editing
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '')
      setDescription(editTask.description || '')
      setPriority(editTask.priority || 'normal')
      setDeadline(editTask.deadline || '')
      setColumn(editTask.column || 'todo')
    } else {
      // Reset form when creating new
      setTitle('')
      setDescription('')
      setPriority('normal')
      setDeadline('')
      setColumn('todo')
    }
  }, [editTask, isOpen])

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          {editTask ? 'Task bearbeiten' : 'Neuer Task'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Titel *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#252525] text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="Task-Titel"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Beschreibung</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#252525] text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Optional"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Priorität</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#252525] text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="low">🔵 Niedrig</option>
                <option value="normal">⚪ Normal</option>
                <option value="high">🔴 Hoch</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Spalte</label>
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                className="w-full bg-[#252525] text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="todo">📥 To Do</option>
                <option value="karim">🔄 Karim</option>
                <option value="klausi">🤖 Klausi</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-[#252525] text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#2a2a2a] text-gray-300 hover:bg-[#333] px-4 py-2 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {editTask ? 'Speichern' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTaskModal
