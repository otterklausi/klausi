import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const priorityColors = {
  high: 'border-l-red-500',
  normal: 'border-l-gray-500',
  low: 'border-l-blue-400',
}

const priorityLabels = {
  high: '🔴',
  normal: '',
  low: '🔵',
}

function TaskCard({ task, onDelete, onEdit, isDragging }) {
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

  function formatDeadline(deadline) {
    if (!deadline) return null
    const date = new Date(deadline)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const formatted = date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    })

    if (diffDays < 0) return { text: formatted, className: 'text-red-400' }
    if (diffDays <= 7) return { text: formatted, className: 'text-yellow-400' }
    return { text: formatted, className: 'text-gray-400' }
  }

  const deadline = formatDeadline(task.deadline)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit && onEdit(task)}
      className={`bg-[#252525] rounded-lg p-3 cursor-pointer border-l-4 ${
        priorityColors[task.priority]
      } ${isBeingDragged ? 'opacity-50 shadow-2xl scale-105' : 'hover:bg-[#2a2a2a]'} transition-all`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {priorityLabels[task.priority]} {task.title}
          </p>
          {task.description && (
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">{task.description}</p>
          )}
          {deadline && (
            <p className={`text-xs mt-2 ${deadline.className}`}>
              📅 {deadline.text}
            </p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            title="Löschen"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default TaskCard
