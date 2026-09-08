import { useQuery } from '@tanstack/react-query'
import { getProjects } from '@/api/projects'
import { ProjectCard } from '@/components/ProjectCard'

export function ProjectListPage() {
  // data/isLoading/error nereden geliyor, data?.data neden iki kere data:
  // bkz. docs/notlar/react-query-temelleri.md
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  if (isLoading) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>
  }

  if (error) {
    return <div className="p-8 text-red-600">Projeler yüklenemedi.</div>
  }

  const projects = data?.data ?? []

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Projeler</h1>
      </div>

      {projects.length === 0 ? (
        <div className="text-slate-500">Henüz proje yok.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
