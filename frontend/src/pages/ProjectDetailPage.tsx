import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getProjectById } from '@/api/projects'
import { getTasksByProject } from '@/api/tasks'
import { KanbanBoard } from '@/components/KanbanBoard'
import { TaskListView } from '@/components/TaskListView'

export function ProjectDetailPage() {
  // URL'den (/projects/:id) proje id'sini okur - route tanimindaki ":id"
  // ile ayni isimde olmasi gerekiyor. useParams her zaman string dondurur,
  // API cagrisi icin Number()'a ceviriyoruz.
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  // Hangi gorunum secili - Kanban mi Duz Liste mi.
  const [view, setView] = useState<'kanban' | 'list'>('kanban')

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

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setView('kanban')}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              view === 'kanban'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Kanban
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              view === 'list'
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Düz Liste
          </button>
        </div>
      </div>

      {isTasksLoading ? (
        <p className="text-muted-foreground">Görevler yükleniyor...</p>
      ) : view === 'kanban' ? (
        <KanbanBoard tasks={tasks} projectId={projectId} />
      ) : (
        <TaskListView tasks={tasks} projectId={projectId} />
      )}
    </div>
  )
}
