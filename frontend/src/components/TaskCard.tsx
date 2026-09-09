import { useDraggable } from '@dnd-kit/core'
import type { TaskPriorityLevel, TaskResponse } from '@/types/task'

// Her onceligin rozet rengi - Takip tasarim sistemindeki hex degerlerle
// birebir (ProjectCard'daki statusColors ile ayni desen/gerekce).
export const priorityColors: Record<TaskPriorityLevel, string> = {
  Low: 'bg-[#EEF1F5] text-[#52606D]',
  Medium: 'bg-[#E5F0FA] text-[#2C5A82]',
  High: 'bg-[#FBEEDD] text-[#A05A16]',
  Critical: 'bg-[#FCE7EA] text-[#A3283F]',
}

export const priorityLabels: Record<TaskPriorityLevel, string> = {
  Low: 'Düşük',
  Medium: 'Orta',
  High: 'Yüksek',
  Critical: 'Kritik',
}

interface TaskCardProps {
  task: TaskResponse
  // Karta tiklaninca (surukleme degil, normal tik) ust componente
  // "bu gorev tiklandi" diye haber verir - duzenleme modalini acmak icin.
  onClick: (task: TaskResponse) => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
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
      onClick={() => onClick(task)}
      className={`rounded-xl border border-border bg-card p-3 shadow-sm ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}
        >
          {priorityLabels[task.priority]}
        </span>
      </div>

      <h4 className="text-sm font-medium text-foreground">{task.title}</h4>

      {task.description && (
        <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
      )}

      {task.dueDate && (
        <p className="mt-2 text-xs text-muted-foreground">
          {new Date(task.dueDate).toLocaleDateString('tr-TR')}
        </p>
      )}
    </div>
  )
}
