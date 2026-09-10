import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Plus } from 'lucide-react'
import { createTask } from '@/api/tasks'
import { priorityColors, priorityLabels } from '@/components/TaskCard'
import { useUpdateTaskStatus } from '@/hooks/useUpdateTaskStatus'
import type { TaskResponse, TaskStatus } from '@/types/task'

interface SubtaskAddRowProps {
  parentId: number
  projectId: number
}

// Her ana gorev hucresinin altindaki "+ Alt gorev ekle" satiri. Modal acmiyoruz -
// alt gorevde sadece baslik var, tam formu acmak gereksiz olurdu. ProjectFormModal'daki
// teknoloji-etiketi input'uyla ayni "Enter'la ekle" deseni.
function SubtaskAddRow({ parentId, projectId }: SubtaskAddRowProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()

  function handleSubmit() {
    const trimmed = title.trim()
    setIsAdding(false)
    setTitle('')

    if (!trimmed) return

    createTask(projectId, {
      title: trimmed,
      priority: 'Medium',
      parentTaskId: parentId,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    })
  }

  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <Plus className="size-3" />
        Alt görev ekle
      </button>
    )
  }

  return (
    <input
      autoFocus
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSubmit()
        if (e.key === 'Escape') {
          setIsAdding(false)
          setTitle('')
        }
      }}
      // onBlur: kullanici baska bir yere tiklayip input'tan "cikarsa" da
      // gorev eklensin - sadece Enter'a basmak zorunda kalmasin.
      onBlur={handleSubmit}
      placeholder="Alt görev başlığı..."
      className="w-full rounded-lg bg-muted px-2 py-1 text-xs text-foreground outline-none"
    />
  )
}

interface TaskListViewProps {
  tasks: TaskResponse[]
  projectId: number
  // Alttaki kesikli "Görev ekle" butonu ust sayfadaki modali aciyor - gorev
  // modali artik ProjectDetailPage'de duruyor.
  onAddTask: () => void
}

export function TaskListView({ tasks, projectId, onAddTask }: TaskListViewProps) {
  const statusMutation = useUpdateTaskStatus(projectId)

  const mainTasks = tasks.filter((task) => task.parentTaskId === null)

  // Duz listede sadece "yapildi mi yapilmadi mi" var - backend'deki 4 durumdan
  // (Todo/InProgress/Blocked/Done) sadece Done ayrimi gosteriliyor, digerleri
  // Kanban'in isi.
  function toggleDone(task: TaskResponse) {
    const newStatus: TaskStatus = task.status === 'Done' ? 'Todo' : 'Done'
    statusMutation.mutate({ id: task.id, status: newStatus })
  }

  return (
    <div className="flex flex-col gap-3">
      {mainTasks.map((mainTask) => {
        const subTasks = tasks.filter((task) => task.parentTaskId === mainTask.id)
        const isDone = mainTask.status === 'Done'

        return (
          <div
            key={mainTask.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleDone(mainTask)}
                className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${
                  isDone ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                }`}
              >
                {isDone && <Check className="size-3.5" />}
              </button>

              <span
                className={`flex-1 text-sm font-medium ${
                  isDone ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}
              >
                {mainTask.title}
              </span>

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[mainTask.priority]}`}
              >
                {priorityLabels[mainTask.priority]}
              </span>

              {mainTask.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(mainTask.dueDate).toLocaleDateString('tr-TR')}
                </span>
              )}
            </div>

            {subTasks.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5 border-t border-border pl-8 pt-3">
                {subTasks.map((subTask) => {
                  const isSubDone = subTask.status === 'Done'
                  return (
                    <div key={subTask.id} className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleDone(subTask)}
                        className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                          isSubDone
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border'
                        }`}
                      >
                        {isSubDone && <Check className="size-3" />}
                      </button>
                      <span
                        className={`text-sm ${
                          isSubDone ? 'text-muted-foreground line-through' : 'text-foreground'
                        }`}
                      >
                        {subTask.title}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-2 pl-8">
              <SubtaskAddRow parentId={mainTask.id} projectId={projectId} />
            </div>
          </div>
        )
      })}

      {/* Jupyter defterindeki "hucre ekle" butonuyla ayni fikir - kesikli
          cizgili, en altta, yeni bir "blok" (ana gorev) eklemeye davet ediyor. */}
      <button
        type="button"
        onClick={onAddTask}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border p-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
      >
        <Plus className="size-4" />
        Görev ekle
      </button>
    </div>
  )
}
