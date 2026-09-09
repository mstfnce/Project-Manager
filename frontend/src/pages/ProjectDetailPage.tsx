import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getProjectById } from '@/api/projects'
import { getTasksByProject } from '@/api/tasks'
import { KanbanBoard } from '@/components/KanbanBoard'

export function ProjectDetailPage() {
  // URL'den (/projects/:id) proje id'sini okur - route tanimindaki ":id"
  // ile ayni isimde olmasi gerekiyor. useParams her zaman string dondurur,
  // API cagrisi icin Number()'a ceviriyoruz.
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)

  const { data: projectData, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  })

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasksByProject(projectId),
  })

  if (isProjectLoading) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>
  }

  if (projectError) {
    return <div className="p-8 text-red-600">Proje yüklenemedi.</div>
  }

  const project = projectData?.data
  const tasks = tasksData?.data ?? []

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">{project?.name}</h1>
        {project?.description && (
          <p className="mt-1 text-sm text-slate-500">{project.description}</p>
        )}

        {project && project.techStack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {isTasksLoading ? (
        <p className="text-slate-500">Görevler yükleniyor...</p>
      ) : (
        <KanbanBoard tasks={tasks} projectId={projectId} />
      )}
    </div>
  )
}
