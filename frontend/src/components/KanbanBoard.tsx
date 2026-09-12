import {
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { TaskCard } from '@/components/TaskCard'
import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus'
import type { TaskResponse, TaskStatus } from '@/types/task'

// Sutun sirasi, Turkce basliklar ve baslikta duran renkli nokta - backend'deki
// WorkItemStatus enum sirasiyla birebir ayni (Todo -> InProgress -> Blocked -> Done).
const columns: { status: TaskStatus; title: string; dotColor: string }[] = [
  { status: 'Todo', title: 'Yapılacak', dotColor: 'bg-[#8A8B92]' },
  { status: 'InProgress', title: 'Devam Ediyor', dotColor: 'bg-[#1E2A4A]' },
  { status: 'Blocked', title: 'Bloke', dotColor: 'bg-[#BA1A1A]' },
  { status: 'Done', title: 'Tamamlandı', dotColor: 'bg-[#A9C7E8]' },
]

interface KanbanColumnProps {
  status: TaskStatus
  title: string
  dotColor: string
  tasks: TaskResponse[]
  // Bir gorevin alt gorevleri - kartta "2/5" ilerlemesini gostermek icin.
  allTasks: TaskResponse[]
  onTaskClick: (task: TaskResponse) => void
  onAddTask: () => void
}

// Sutunu ayri bir component yapmamizin sebebi: useDroppable bir hook, hook'lar
// sadece component govdesinde cagrilabilir - columns.map(...) icinde satir
// arasinda dogrudan cagiramayiz.
function KanbanColumn({
  status,
  title,
  dotColor,
  tasks,
  allTasks,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      // Sutunun kendi mavi zemini var (ana sayfa zemininden koyu); surukleme
      // sirasindaki "buraya birakabilirsin" isareti bu yuzden arka plan degil,
      // cerceve halkasi.
      className={`flex min-h-[580px] flex-col gap-3.5 rounded-2xl bg-muted p-3.5 transition-shadow ${
        isOver ? 'ring-2 ring-primary/25' : ''
      }`}
    >
      <div className="flex items-center justify-between px-1.5 pt-1">
        <div className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${dotColor}`} />
          <h2 className="text-[15px] font-bold text-heading">{title}</h2>
          <span className="rounded-full bg-card px-2 py-0.5 text-xs font-bold text-muted-foreground">
            {tasks.length}
          </span>
        </div>

        {/* "+" sadece Yapilacak sutununda: backend yeni gorevi her zaman Todo
            ile aciyor, diger sutunlarda buton olsa gorev yine buraya duserdi. */}
        {status === 'Todo' && (
          <button
            type="button"
            onClick={onAddTask}
            title="Görev ekle"
            aria-label="Görev ekle"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <Plus className="size-[18px]" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <p className="px-1.5 text-xs text-muted-foreground">Görev yok</p>
        ) : (
          tasks.map((task) => {
            const subTasks = allTasks.filter((t) => t.parentTaskId === task.id)

            return (
              <TaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
                subTaskTotal={subTasks.length}
                subTaskDone={subTasks.filter((t) => t.status === 'Done').length}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  tasks: TaskResponse[]
  projectId: number
  // Bir karta tiklaninca ust sayfaya haber verir - gorev modali artik
  // ProjectDetailPage'de duruyor ("Görev Ekle" butonu sekmelerin yaninda).
  onEditTask: (task: TaskResponse) => void
  // "Yapılacak" sutunundaki "+" butonu da ayni modali aciyor.
  onAddTask: () => void
}

export function KanbanBoard({ tasks, projectId, onEditTask, onAddTask }: KanbanBoardProps) {
  // PointerSensor, fare/parmak 8 piksel hareket etmeden surukleme baslatmaz.
  // Bu sayede kisa bir tiklama "surukleme" sayilmiyor, TaskCard'daki onClick
  // normal calisabiliyor - sensor olmasaydi her tiklama surukleme gibi
  // algilanip karta tiklayarak duzenleme acmak imkansiz olurdu.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  // Kanban sadece ana gorevleri gosterir - alt gorevler (parentTaskId dolu
  // olanlar) sadece Duz Liste'de gorunur, bu yuzden board'a girmeden once
  // eleniyor.
  const mainTasks = tasks.filter((task) => task.parentTaskId === null)

  // Optimistic update mantigi artik ortak hook'ta - TaskListView de ayni
  // hook'u kullanacak, kod tekrari olmasin diye.
  const statusMutation = useUpdateTaskStatus(projectId)

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
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            dotColor={column.dotColor}
            tasks={mainTasks.filter((task) => task.status === column.status)}
            allTasks={tasks}
            onTaskClick={onEditTask}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </DndContext>
  )
}
