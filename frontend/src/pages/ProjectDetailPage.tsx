import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getProjectById } from '@/api/projects'
import { getTasksByProject } from '@/api/tasks'
import { KanbanBoard } from '@/components/KanbanBoard'
import { NoteListView } from '@/components/NoteListView'
import { TaskListView } from '@/components/TaskListView'

export function ProjectDetailPage() {
  // URL'den (/projects/:id) proje id'sini okur - route tanimindaki ":id"
  // ile ayni isimde olmasi gerekiyor. useParams her zaman string dondurur,
  // API cagrisi icin Number()'a ceviriyoruz.
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  // Hangi gorunum secili - Kanban, Duz Liste ya da Notlar.
  const [view, setView] = useState<'kanban' | 'list' | 'notes'>('kanban')

  const { data: projectData, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  })

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasksByProject(projectId),
  })

  if (isProjectLoading) {
    return <div className="p-8 text-muted-foreground">Yükleniyor...</div>
  }

  if (projectError) {
    return <div className="p-8 text-destructive">Proje yüklenemedi.</div>
  }

  const project = projectData?.data
  const tasks = tasksData?.data ?? []

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">{project?.name}</h1>
        {project?.description && (
          <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
        )}

        {project && project.techStack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ayri cerceveli butonlar - aktif olan dolu lacivert, digerleri
          beyaz/cerceveli (Mustafa'nin onayladigi mockup stili). */}
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setView('kanban')}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
            view === 'kanban'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          Kanban
        </button>
        <button
          type="button"
          onClick={() => setView('list')}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
            view === 'list'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          Düz Liste
        </button>
        <button
          type="button"
          onClick={() => setView('notes')}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
            view === 'notes'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          Notlar
        </button>
      </div>

      {view === 'kanban' ? (
        isTasksLoading ? (
          <p className="text-muted-foreground">Görevler yükleniyor...</p>
        ) : (
          <KanbanBoard tasks={tasks} projectId={projectId} />
        )
      ) : view === 'list' ? (
        isTasksLoading ? (
          <p className="text-muted-foreground">Görevler yükleniyor...</p>
        ) : (
          <TaskListView tasks={tasks} projectId={projectId} />
        )
      ) : (
        // NoteListView, tasks cache'inden bagimsiz kendi verisini kendi
        // icinde cekiyor - isTasksLoading burada anlamsiz.
        <NoteListView projectId={projectId} />
      )}
    </div>
  )
}
