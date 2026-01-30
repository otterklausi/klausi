import { useDroppable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreHorizontal, Plus } from 'lucide-react'
import TaskCard from './TaskCard'

export default function Column({ column, tasks, onDeleteTask, onEditTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between p-4 rounded-t-2xl border-b border-[var(--border-color)] ${column.color} bg-opacity-10`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${column.color}`} />
          <h3 className="font-display font-semibold">{column.title}</h3>
          <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
            {tasks.length}
          </span>
        </div>
        <button className="p-1 rounded hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 rounded-b-2xl bg-[var(--bg-elevated)]/30 min-h-[200px] transition-colors ${
          isOver ? 'bg-primary-500/10 ring-2 ring-primary-500/30' : ''
        }`}
      >
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onDelete={() => onDeleteTask(task.id)}
              onEdit={() => onEditTask(task)}
            />
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-[var(--text-tertiary)]">
            <p className="text-sm">Keine Tasks</p>
            <p className="text-xs mt-1">Ziehe Tasks hierher</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
