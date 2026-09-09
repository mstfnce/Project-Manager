import { DndContext, useDroppable, type DragEndEvent } from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TaskCard } from '@/components/TaskCard'
import { updateTaskStatus } from '@/api/tasks'
import type { TaskResponse, TaskStatus } from '@/types/task'

// Sutun sirasi ve Turkce basliklar burada tanimli - backend'deki
// WorkItemStatus enum sirasiyla birebir ayni (Todo -> InProgress -> Blocked -> Done).
const columns: { status: TaskStatus; title: string }[] = [
  { status: 'Todo', title: 'Yapılacak' },
  { status: 'InProgress', title: 'Devam Ediyor' },
  { status: 'Blocked', title: 'Bloke' },
  { status: 'Done', title: 'Tamamlandı' },
]

interface KanbanColumnProps {
  status: TaskStatus
  title: string
  tasks: TaskResponse[]
}

// Sutunu ayri bir component yapmamizin sebebi: useDroppable bir hook, hook'lar
// sadece component govdesinde cagrilabilir - columns.map(...) icinde satir
// arasinda dogrudan cagiramayiz.
function KanbanColumn({ status, title, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-3 rounded-lg p-2 ${isOver ? 'bg-slate-50' : ''}`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {title}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400">Görev yok</p>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  tasks: TaskResponse[]
  projectId: number
}

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      updateTaskStatus(id, { status }),

    // Istek gitmeden ONCE calisir - once ekrani guncelliyoruz (optimistic update).
    onMutate: async ({ id, status }) => {
      const queryKey = ['tasks', projectId]

      // Bu anahtarla devam eden bir fetch varsa iptal et - yoksa o fetch
      // bizim optimistic guncellememizin ustune eski veriyi yazabilir.
      await queryClient.cancelQueries({ queryKey })

      // Hata olursa geri donebilmek icin mevcut veriyi yedekle.
      const previousTasks = queryClient.getQueryData(queryKey)

      // Cache'i hemen yeni status ile guncelle - kullanici kartin
      // tasindigini aninda gorur, API cevabini beklemez.
      queryClient.setQueryData(
        queryKey,
        (old: { data: TaskResponse[] } | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map((task) => (task.id === id ? { ...task, status } : task)),
          }
        },
      )

      return { previousTasks }
    },

    // Istek basarisiz olursa, onMutate'de yedeklenen veriye geri don.
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks)
      }
    },

    // Basarili da olsa basarisiz da olsa, sunucudaki gercek veriyle senkron
    // olmak icin sorguyu tekrar calistir.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return // bos bir alana birakildiysa hicbir sey yapma

    const taskId = Number(active.id)
    const newStatus = over.id as TaskStatus
    const task = tasks.find((t) => t.id === taskId)

    // Ayni sutuna birakildiysa gereksiz istek atma.
    if (task && task.status !== newStatus) {
      statusMutation.mutate({ id: taskId, status: newStatus })
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={tasks.filter((task) => task.status === column.status)}
          />
        ))}
      </div>
    </DndContext>
  )
}
