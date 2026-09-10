import { useDraggable } from '@dnd-kit/core'
import { CalendarDays, CheckCircle2, ListChecks } from 'lucide-react'
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

// "18 Eki" gibi kisa tarih - kart dar oldugu icin 10.09.2026 yerine bunu
// kullaniyoruz, referans tasarimda da boyle.
function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

interface TaskCardProps {
  task: TaskResponse
  // Karta tiklaninca (surukleme degil, normal tik) ust componente
  // "bu gorev tiklandi" diye haber verir - duzenleme modalini acmak icin.
  onClick: (task: TaskResponse) => void
  // Alt gorev ilerlemesi ("2/5"). Hesabi KanbanBoard yapiyor cunku alt
  // gorevlerin tam listesi orada; kart sadece gelen sayilari basiyor.
  subTaskTotal: number
  subTaskDone: number
}

export function TaskCard({ task, onClick, subTaskTotal, subTaskDone }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  const isDone = task.status === 'Done'

  // Teslim tarihi gecmisse tarihi kirmizi gosteriyoruz - ama gorev zaten
  // bittiyse gecikmenin anlami kalmiyor, o yuzden isDone kontrolu de var.
  const isOverdue = !isDone && task.dueDate !== null && new Date(task.dueDate) < new Date()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick(task)}
      // hover'da kartin bir tik yukari kalkmasi, sutun zemininden ayrildigi
      // hissini veriyor - referans tasarimdaki davranis.
      className={`flex cursor-pointer flex-col gap-3 rounded-xl bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {isDone ? (
          // Biten gorevde oncelik rozeti artik bilgi tasimiyor - yerine
          // "Tamamlandı" rozeti koyuyoruz.
          <span className="flex items-center gap-1 rounded-md bg-[#E1F3E9] px-2 py-0.5 text-[11px] font-bold text-[#1E7A4C]">
            <CheckCircle2 className="size-3" />
            Tamamlandı
          </span>
        ) : (
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${priorityColors[task.priority]}`}
          >
            {priorityLabels[task.priority]}
          </span>
        )}

        {subTaskTotal > 0 && (
          <span className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            <ListChecks className="size-3" />
            {subTaskDone}/{subTaskTotal}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h4
          className={`text-[15px] font-semibold leading-snug ${
            isDone ? 'text-muted-foreground line-through' : 'text-heading'
          }`}
        >
          {task.title}
        </h4>

        {task.description && (
          // line-clamp-2: uzun aciklama karti sismesin, iki satirda kesilsin.
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        )}
      </div>

      {isDone && task.completedAt ? (
        <span className="flex w-fit items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[11.5px] font-semibold text-brand">
          <CheckCircle2 className="size-3.5" />
          {formatShortDate(task.completedAt)} bitti
        </span>
      ) : (
        task.dueDate && (
          <span
            className={`flex items-center gap-1.5 text-[11.5px] font-semibold ${
              isOverdue ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            <CalendarDays className="size-3.5" />
            {formatShortDate(task.dueDate)}
          </span>
        )
      )}
    </div>
  )
}
