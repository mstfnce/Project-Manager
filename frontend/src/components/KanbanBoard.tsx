import { TaskCard } from '@/components/TaskCard'
import type { TaskResponse, TaskStatus } from '@/types/task'

// Sutun sirasi ve Turkce basliklar burada tanimli - backend'deki
// WorkItemStatus enum sirasiyla birebir ayni (Todo -> InProgress -> Blocked -> Done).
const columns: { status: TaskStatus; title: string }[] = [
  { status: 'Todo', title: 'Yapılacak' },
  { status: 'InProgress', title: 'Devam Ediyor' },
  { status: 'Blocked', title: 'Bloke' },
  { status: 'Done', title: 'Tamamlandı' },
]

interface KanbanBoardProps {
  tasks: TaskResponse[]
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map((column) => {
        // Her sutun, gorev listesini kendi status'une gore filtreleyip
        // sadece kendine ait kartlari gosterir - sunucudan gelen tek liste,
        // burada 4 gruba ayriliyor.
        const columnTasks = tasks.filter((task) => task.status === column.status)

        return (
          <div key={column.status} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              {column.title}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {columnTasks.length === 0 ? (
                <p className="text-xs text-slate-400">Görev yok</p>
              ) : (
                columnTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
