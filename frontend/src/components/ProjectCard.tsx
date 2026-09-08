import { Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProjectResponse, ProjectStatus } from '@/types/project'

// Her durumun rozet rengi - Stitch tasarimindaki pill stiline uyarlandi
// (yumusak/acik arka plan + koyu/saturated yazi rengi). Record<ProjectStatus, string>
// sayesinde TypeScript, 5 durumdan birini unutursak hata verir.
const statusColors: Record<ProjectStatus, string> = {
  Planning: 'bg-slate-100 text-slate-700',
  Active: 'bg-blue-100 text-blue-700',
  Paused: 'bg-amber-100 text-amber-700',
  Completed: 'bg-green-100 text-green-700',
  Archived: 'bg-slate-200 text-slate-500',
}

interface ProjectCardProps {
  // Kart, hangi projeyi gosterecegini disaridan (ProjectListPage'den) alir -
  // kendisi backend'e istek atmaz, sadece kendine verilen veriyi gosterir.
  project: ProjectResponse
  // Kart kendi basina duzenleme/silme yapmaz, sadece "bu proje icin
  // butona basildi" diye ust sayfaya haber verir.
  onEdit: (project: ProjectResponse) => void
  onDelete: (project: ProjectResponse) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    // Kartin tamami artik proje detay sayfasina link - Link bir <a> etiketine
    // derlendigi icin dis div yerine Link'in kendisi disari kart stilini tasiyor.
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{project.name}</h3>
        <div className="flex shrink-0 items-center gap-2">
          {/* stopPropagation olmasaydi bu butonlara tiklamak da Link'in
              click event'ine "kabarir" (bubble) ve detay sayfasina yonlendirirdi. */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onEdit(project)
            }}
            className="text-slate-400 hover:text-slate-700"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onDelete(project)
            }}
            className="text-slate-400 hover:text-red-600"
          >
            <Trash2 className="size-3.5" />
          </button>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status]}`}
          >
            {project.status}
          </span>
        </div>
      </div>

      {project.description && (
        <p className="mb-3 text-sm text-slate-500">{project.description}</p>
      )}

      {project.techStack.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
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

      <div className="flex gap-4 text-xs text-slate-400">
        <span>{project.taskCount} görev</span>
        <span>{project.noteCount} not</span>
      </div>
    </Link>
  )
}
