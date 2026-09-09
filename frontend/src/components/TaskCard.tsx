import { useDraggable } from '@dnd-kit/core'
import type { TaskPriorityLevel, TaskResponse } from '@/types/task'

// Her onceligin rozet rengi - ProjectCard'daki statusColors ile ayni desen.
const priorityColors: Record<TaskPriorityLevel, string> = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-amber-100 text-amber-700',
  Critical: 'bg-red-100 text-red-700',
}

const priorityLabels: Record<TaskPriorityLevel, string> = {
  Low: 'Düşük',
  Medium: 'Orta',
  High: 'Yüksek',
  Critical: 'Kritik',
}

interface TaskCardProps {
  task: TaskResponse
}

export function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}
        >
          {priorityLabels[task.priority]}
        </span>
      </div>

      <h4 className="text-sm font-medium text-slate-900">{task.title}</h4>

      {task.description && (
        <p className="mt-1 text-xs text-slate-500">{task.description}</p>
      )}

      {task.dueDate && (
        <p className="mt-2 text-xs text-slate-400">
          {new Date(task.dueDate).toLocaleDateString('tr-TR')}
        </p>
      )}
    </div>
  )
}
