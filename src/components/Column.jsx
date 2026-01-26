import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'

function Column({ column, tasks, onDeleteTask, onEditTask }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-[#1a1a1a] rounded-xl p-4 min-h-[500px] border-t-4 ${column.color} ${
        isOver ? 'ring-2 ring-blue-500/50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{column.title}</h2>
        <span className="bg-[#2a2a2a] text-gray-400 text-sm px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onEdit={onEditTask} />
          ))}
        </div>
      </SortableContext>

      {tasks.length === 0 && (
        <div className="text-gray-500 text-center py-8 text-sm">
          Keine Tasks
        </div>
      )}
    </div>
  )
}

export default Column
