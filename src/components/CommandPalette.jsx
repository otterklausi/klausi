import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, FileText, LayoutDashboard, StickyNote, Folder } from 'lucide-react'

export default function CommandPalette({ isOpen, onClose, tasks, onSelectTask }) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands = [
    { id: 'dashboard', label: 'Dashboard öffnen', icon: LayoutDashboard, action: () => {} },
    { id: 'kanban', label: 'Kanban Board', icon: LayoutDashboard, action: () => {} },
    { id: 'notes', label: 'Notizen', icon: StickyNote, action: () => {} },
    { id: 'deliverables', label: 'Deliverables', icon: Folder, action: () => {} },
    ...tasks.map(task => ({
      id: task.id,
      label: task.title,
      icon: FileText,
      action: () => onSelectTask(task),
      subtitle: task.column
    }))
  ].filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    (cmd.subtitle && cmd.subtitle.toLowerCase().includes(search.toLowerCase()))
  )

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % commands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (commands[selectedIndex]) {
          commands[selectedIndex].action()
          onClose()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, commands, selectedIndex])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

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
            className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="glass rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)]">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
                <Search size={20} className="text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Suchen..."
                  className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none text-lg"
                  autoFocus
                />
                <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                  <kbd className="px-2 py-1 rounded bg-[var(--bg-elevated)]">ESC</kbd>
                  <span>zum Schließen</span>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto p-2">
                {commands.length === 0 ? (
                  <div className="py-8 text-center text-[var(--text-secondary)]">
                    <p>Keine Ergebnisse gefunden</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {commands.map((cmd, index) => {
                      const Icon = cmd.icon
                      const isSelected = index === selectedIndex
                      
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action()
                            onClose()
                          }}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                            isSelected 
                              ? 'bg-primary-500 text-white' 
                              : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                          }`}
                        >
                          <Icon size={18} className={isSelected ? 'text-white' : 'text-[var(--text-secondary)]'} />
                          <div className="flex-1">
                            <p className="font-medium">{cmd.label}</p>
                            {cmd.subtitle && (
                              <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-[var(--text-tertiary)]'}`}>
                                {cmd.subtitle}
                              </p>
                            )}
                          </div>
                          {isSelected && <Command size={14} className="opacity-50" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-color)] text-xs text-[var(--text-tertiary)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)]">↑↓</kbd>
                    Navigation
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-elevated)]">↵</kbd>
                    Auswählen
                  </span>
                </div>
                <span>{commands.length} Ergebnisse</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
