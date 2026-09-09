import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { TaskCard } from '@/components/TaskCard'
import { TaskFormModal } from '@/components/TaskFormModal'
import { Button } from '@/components/ui/button'
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
  onTaskClick: (task: TaskResponse) => void
}

// Sutunu ayri bir component yapmamizin sebebi: useDroppable bir hook, hook'lar
// sadece component govdesinde cagrilabilir - columns.map(...) icinde satir
// arasinda dogrudan cagiramayiz.
function KanbanColumn({ status, title, tasks, onTaskClick }: KanbanColumnProps) {
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
          tasks.map((task) => <TaskCard key={task.id} task={task} onClick={onTaskClick} />)
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

  // Modal acik mi, ve hangi gorev duzenleniyor (null = "yeni gorev ekle" modu).
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null)

  function handleAddClick() {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  function handleTaskClick(task: TaskResponse) {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  // PointerSensor, fare/parmak 8 piksel hareket etmeden surukleme baslatmaz.
  // Bu sayede kisa bir tiklama "surukleme" sayilmiyor, TaskCard'daki onClick
  // normal calisabiliyor - sensor olmasaydi her tiklama surukleme gibi
  // algilanip karta tiklayarak duzenleme acmak imkansiz olurdu.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

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
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleAddClick} className="gap-1.5">
          <Plus className="size-4" />
          Görev Ekle
        </Button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={tasks.filter((task) => task.status === column.status)}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>
      </DndContext>

      {/* key={editingTask?.id ?? 'create'} - ProjectFormModal'daki numaranin
          aynisi: farkli bir goreve gecince ya da "ekle"ye donunce formun
          eski degerleri kalmasin diye component'i sifirdan mount ediyoruz. */}
      <TaskFormModal
        key={editingTask?.id ?? 'create'}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        task={editingTask}
        projectId={projectId}
      />
    </>
  )
}
