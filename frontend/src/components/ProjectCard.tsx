import { Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProjectResponse, ProjectStatus } from '@/types/project'

// Her durumun rozet rengi - Takip tasarim sistemindeki (docs/design) hex
// degerlerle birebir. index.css'teki genel token'lardan degil, cunku her
// durumun kendine ozgu bir rengi var (5 farkli anlam, tek bir "accent" yetmez).
const statusColors: Record<ProjectStatus, string> = {
  Planning: 'bg-[#EEF1F5] text-[#52606D]',
  Active: 'bg-[#DCE9FF] text-[#1E2A4A]',
  Paused: 'bg-[#FBEEDD] text-[#A05A16]',
  Completed: 'bg-[#E1F3E9] text-[#1E7A4C]',
  Archived: 'bg-[#E9ECF2] text-[#6B7690]',
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
      className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground">{project.name}</h3>
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
            className="text-muted-foreground hover:text-foreground"
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
            className="text-muted-foreground hover:text-destructive"
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
        <p className="mb-3 text-sm text-muted-foreground">{project.description}</p>
      )}

      {project.techStack.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
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

      <div className="flex gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{project.taskCount} görev</span>
        <span>{project.noteCount} not</span>
      </div>
    </Link>
  )
}
