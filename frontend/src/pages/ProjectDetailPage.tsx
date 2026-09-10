import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from 'react-router-dom'
import { LayoutGrid, ListFilter, Plus, ListChecks, StickyNote } from 'lucide-react'
import { getNotesByProject } from '@/api/notes'
import { getProjectById } from '@/api/projects'
import { getTasksByProject } from '@/api/tasks'
import { KanbanBoard } from '@/components/KanbanBoard'
import { NoteListView } from '@/components/NoteListView'
import { TaskFormModal } from '@/components/TaskFormModal'
import { TaskListView } from '@/components/TaskListView'
import type { ProjectStatus } from '@/types/project'
import type { TaskResponse } from '@/types/task'

// Durum rozeti renkleri - ProjectCard'daki ile ayni hex degerler.
const statusColors: Record<ProjectStatus, string> = {
  Planning: 'bg-[#EEF1F5] text-[#52606D]',
  Active: 'bg-[#DCE9FF] text-[#1E2A4A]',
  Paused: 'bg-[#FBEEDD] text-[#A05A16]',
  Completed: 'bg-[#E1F3E9] text-[#1E7A4C]',
  Archived: 'bg-[#E9ECF2] text-[#6B7690]',
}

const statusDotColors: Record<ProjectStatus, string> = {
  Planning: 'bg-[#52606D]',
  Active: 'bg-[#44617E]',
  Paused: 'bg-[#A05A16]',
  Completed: 'bg-[#1E7A4C]',
  Archived: 'bg-[#6B7690]',
}

const statusLabels: Record<ProjectStatus, string> = {
  Planning: 'Planlama',
  Active: 'Aktif Proje',
  Paused: 'Duraklatıldı',
  Completed: 'Tamamlandı',
  Archived: 'Arşivlendi',
}

export function ProjectDetailPage() {
  // URL'den (/projects/:id) proje id'sini okur - route tanimindaki ":id"
  // ile ayni isimde olmasi gerekiyor. useParams her zaman string dondurur,
  // API cagrisi icin Number()'a ceviriyoruz.
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  // Global Notlar sayfasindan "Projeye git" ile gelindiginde adres
  // /projects/5?tab=notes&note=12 seklinde olur - o zaman Kanban yerine
  // dogrudan Notlar sekmesiyle acilip o not seciliyor.
  const [searchParams] = useSearchParams()
  const [view, setView] = useState<'kanban' | 'list' | 'notes'>(
    searchParams.get('tab') === 'notes' ? 'notes' : 'kanban',
  )

  // Gorev ekleme/duzenleme modali sayfada duruyor, cunku "Görev Ekle" butonu
  // sekmelerin yaninda - hem Kanban hem Duz Liste ayni modali kullaniyor.
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null)

  const { data: projectData, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  })

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasksByProject(projectId),
  })

  // Sadece sekmedeki not sayisi rozeti icin - NoteListView de ayni anahtari
  // kullandigi icin React Query ikinci bir istek atmiyor, cache'ten donuyor.
  const { data: notesData } = useQuery({
    queryKey: ['notes', projectId],
    queryFn: () => getNotesByProject(projectId),
  })

  function handleAddTask() {
    setEditingTask(null)
    setIsTaskModalOpen(true)
  }

  function handleEditTask(task: TaskResponse) {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  if (isProjectLoading) {
    return <div className="p-8 text-muted-foreground">Yükleniyor...</div>
  }

  if (projectError) {
    return <div className="p-8 text-destructive">Proje yüklenemedi.</div>
  }

  const project = projectData?.data
  const tasks = tasksData?.data ?? []
  const noteCount = notesData?.data.length ?? 0

  // Tamamlanma yuzdesi burada gercekten hesaplanabiliyor: proje detayinda
  // zaten butun gorevler elimizde. (Projeler listesinde hesaplanamiyor,
  // orada sadece toplam gorev sayisi geliyor - bkz. ROADMAP 7.2.)
  const mainTasks = tasks.filter((task) => task.parentTaskId === null)
  const doneCount = mainTasks.filter((task) => task.status === 'Done').length
  const completionPercent =
    mainTasks.length === 0 ? 0 : Math.round((doneCount / mainTasks.length) * 100)

  const tabs = [
    { value: 'kanban' as const, label: 'Kanban', icon: LayoutGrid, count: mainTasks.length },
    { value: 'list' as const, label: 'Düz Liste', icon: ListChecks, count: tasks.length },
    { value: 'notes' as const, label: 'Notlar', icon: StickyNote, count: noteCount },
  ]

  return (
    <div className="p-8">
      {/* Proje kimlik karti */}
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-heading">
              {project?.name}
            </h1>
            {project && (
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold ${statusColors[project.status]}`}
              >
                <span className={`size-2 rounded-full ${statusDotColors[project.status]}`} />
                {statusLabels[project.status]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11.5px] font-semibold text-muted-foreground">Tamamlanma</p>
              <p className="text-base font-bold text-heading">%{completionPercent}</p>
            </div>
            <div className="h-2.5 w-28 overflow-hidden rounded-full bg-accent">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>

        {project?.description && (
          <p className="max-w-4xl text-[13.5px] leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        )}

        {project && project.techStack.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-faint">
              Teknolojiler:
            </span>
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-muted px-2.5 py-1 text-[11.5px] font-semibold text-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sekme cubugu (pill grubu) + sag tarafta filtre ve Gorev Ekle */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-2xl bg-muted p-1.5 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = view === tab.value

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setView(tab.value)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground'
                }`}
              >
                <Icon className="size-[18px]" />
                {tab.label}
                <span
                  className={`ml-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                    isActive ? 'bg-primary-foreground/20' : 'bg-card text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* Simdilik sadece gorsel - ileride goreve gore filtrelemeyi aktif edecegiz. */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-[13px] font-semibold text-foreground shadow-sm">
            <ListFilter className="size-[17px] text-muted-foreground" />
            Tüm Görevler
          </div>
          <button
            type="button"
            onClick={handleAddTask}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="size-[17px]" />
            Görev Ekle
          </button>
        </div>
      </div>

      {view === 'kanban' ? (
        isTasksLoading ? (
          <p className="text-muted-foreground">Görevler yükleniyor...</p>
        ) : (
          <KanbanBoard
            tasks={tasks}
            projectId={projectId}
            onEditTask={handleEditTask}
            onAddTask={handleAddTask}
          />
        )
      ) : view === 'list' ? (
        isTasksLoading ? (
          <p className="text-muted-foreground">Görevler yükleniyor...</p>
        ) : (
          <TaskListView tasks={tasks} projectId={projectId} onAddTask={handleAddTask} />
        )
      ) : (
        // NoteListView, tasks cache'inden bagimsiz kendi verisini kendi
        // icinde cekiyor - isTasksLoading burada anlamsiz.
        <NoteListView
          projectId={projectId}
          initialNoteId={Number(searchParams.get('note')) || null}
        />
      )}

      {/* key={editingTask?.id ?? 'create'} - farkli bir goreve gecince ya da
          "ekle"ye donunce formun eski degerleri kalmasin diye component
          sifirdan mount ediliyor. */}
      <TaskFormModal
        key={editingTask?.id ?? 'create'}
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        task={editingTask}
        projectId={projectId}
      />
    </div>
  )
}
