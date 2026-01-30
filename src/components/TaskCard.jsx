import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Calendar, Trash2, GripVertical, AlertCircle, Clock, ArrowDown } from 'lucide-react'

const priorityConfig = {
  high: { 
    color: 'text-red-400', 
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: AlertCircle,
    label: 'Hoch'
  },
  normal: { 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: Clock,
    label: 'Normal'
  },
  low: { 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: ArrowDown,
    label: 'Niedrig'
  },
}

export default function TaskCard({ task, onDelete, onEdit, isDragging, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isBeingDragged = isDragging || isSortableDragging
  const priority = priorityConfig[task.priority] || priorityConfig.normal
  const PriorityIcon = priority.icon

  function formatDeadline(deadline) {
    if (!deadline) return null
    const date = new Date(deadline)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const formatted = date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit',
    })

    if (diffDays < 0) return { text: formatted, urgent: true, overdue: true }
    if (diffDays <= 3) return { text: formatted, urgent: true, overdue: false }
    if (diffDays <= 7) return { text: formatted, urgent: false, overdue: false }
    return { text: formatted, urgent: false, overdue: false }
  }

  const deadline = formatDeadline(task.deadline)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onEdit && onEdit(task)}
      className={`
        group relative p-4 rounded-xl cursor-pointer
        bg-[var(--bg-secondary)] border border-[var(--border-color)]
        hover:border-primary-500/50 hover:shadow-lg
        transition-all duration-200
        ${isBeingDragged ? 'opacity-50 rotate-2 scale-105 shadow-2xl ring-2 ring-primary-500' : ''}
        ${priority.borderColor}
      `}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} className="text-[var(--text-tertiary)]" />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 pl-4">
          {/* Title */}
          <h4 className="text-[var(--text-primary)] text-sm font-medium leading-tight line-clamp-2">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-[var(--text-secondary)] text-xs mt-1.5 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 mt-3">
            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${priority.bgColor} ${priority.color}`}>
              <PriorityIcon size={12} />
              <span className="hidden sm:inline">{priority.label}</span>
            </span>

            {/* Deadline */}
            {deadline && (
              <span className={`inline-flex items-center gap-1 text-xs ${
                deadline.overdue ? 'text-red-400' : 
                deadline.urgent ? 'text-yellow-400' : 'text-[var(--text-tertiary)]'
              }`}>
                <Calendar size={12} />
                {deadline.text}
                {deadline.overdue && <span className="text-red-400 font-medium"> (überfällig)</span>}
              </span>
            )}
          </div>
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-[var(--text-tertiary)] transition-all"
            title="Löschen"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
