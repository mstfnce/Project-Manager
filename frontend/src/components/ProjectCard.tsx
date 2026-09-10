import { CheckCircle2, Clock, FileText, Pencil, StickyNote, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ProjectResponse, ProjectStatus } from '@/types/project'

// Her durumun rozet/ikon rengi - Takip tasarim sistemindeki (docs/design)
// hex degerlerle birebir. index.css'teki genel token'lardan degil, cunku her
// durumun kendine ozgu bir rengi var (5 farkli anlam, tek bir "accent" yetmez).
const statusColors: Record<ProjectStatus, string> = {
  Planning: 'bg-[#EEF1F5] text-[#52606D]',
  Active: 'bg-[#DCE9FF] text-[#1E2A4A]',
  Paused: 'bg-[#FBEEDD] text-[#A05A16]',
  Completed: 'bg-[#E1F3E9] text-[#1E7A4C]',
  Archived: 'bg-[#E9ECF2] text-[#6B7690]',
}

// Rozetin icindeki kucuk nokta - arka planla ayni aileden ama daha koyu.
const statusDotColors: Record<ProjectStatus, string> = {
  Planning: 'bg-[#52606D]',
  Active: 'bg-[#44617E]',
  Paused: 'bg-[#A05A16]',
  Completed: 'bg-[#1E7A4C]',
  Archived: 'bg-[#6B7690]',
}

const statusLabels: Record<ProjectStatus, string> = {
  Planning: 'Planlama',
  Active: 'Aktif',
  Paused: 'Duraklatıldı',
  Completed: 'Tamamlandı',
  Archived: 'Arşivlendi',
}

// Kart ikonu duruma gore degisiyor (mockup'taki gibi): tamamlanan projede
// tik, planlamada saat, digerlerinde dokuman ikonu.
const statusIcons: Record<ProjectStatus, typeof FileText> = {
  Planning: Clock,
  Active: FileText,
  Paused: Clock,
  Completed: CheckCircle2,
  Archived: FileText,
}

// "2 gün önce" gibi goreli tarih - Intl.RelativeTimeFormat tarayicinin kendi
// yerellestirme motoru, ekstra kutuphane gerekmiyor.
function formatRelativeDate(isoDate: string) {
  const diffMs = new Date(isoDate).getTime() - Date.now()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Bugün'

  const formatter = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' })
  return formatter.format(diffDays, 'day')
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
  const StatusIcon = statusIcons[project.status]

  // Gorev yoksa 0'a bolmemek icin ozel durum - alt gorevler de sayiliyor,
  // "proje %X bitti" tanimimiz bu (bkz. ROADMAP, Bolum 8).
  const completionPercent =
    project.taskCount === 0
      ? 0
      : Math.round((project.completedTaskCount / project.taskCount) * 100)

  return (
    // Kartin tamami proje detay sayfasina link - Link bir <a> etiketine
    // derlendigi icin dis div yerine Link'in kendisi kart stilini tasiyor.
    <Link
      to={`/projects/${project.id}`}
      className="flex h-full flex-col gap-[0.85rem] rounded-2xl border border-border bg-card p-[1.2rem] shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid size-[38px] place-items-center rounded-xl ${statusColors[project.status]}`}
        >
          <StatusIcon className="size-[18px]" />
        </div>

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
            className="text-faint hover:text-foreground"
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
            className="text-faint hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>

          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusColors[project.status]}`}
          >
            <span className={`size-1.5 rounded-full ${statusDotColors[project.status]}`} />
            {statusLabels[project.status]}
          </span>
        </div>
      </div>

      {/* Aciklama her zaman 2 satirlik yer kapliyor (min-h), etiket satiri da
          hic etiket olmasa bile yerini koruyor - boylece farkli iceriklere
          sahip kartlarda ilerleme cubugu ve alt bilgi ayni hizada duruyor. */}
      <div>
        <h3 className="truncate text-[14.5px] font-extrabold text-heading">{project.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-[37px] text-[12.3px] leading-[1.5] text-muted-foreground">
          {project.description}
        </p>
      </div>

      <div className="flex min-h-[22px] flex-wrap gap-1.5">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="flex h-[22px] items-center rounded-lg bg-muted px-2 text-[10.8px] font-semibold text-brand"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* mt-auto: kart satirdaki en uzun kart kadar uzadiginda, bu blok
          ve altindaki alt bilgi hep en alta yaslanip hizali kaliyor. */}
      <div className="mt-auto">
        <div className="mb-1.5 flex items-center justify-between text-[11.8px] font-bold text-muted-foreground">
          {/* "acik gorev" degil "3/8 gorev": taskCount butun gorevleri sayiyor,
              acik olanlari degil - yanindaki yuzdeyle de boyle tutarli. */}
          <span>
            {project.completedTaskCount}/{project.taskCount} görev
          </span>
          <span className="text-[13px] text-heading">%{completionPercent}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-[11.5px] text-faint">
        <span className="flex items-center gap-1.5 font-semibold">
          <StickyNote className="size-3.5" />
          {project.noteCount} not
        </span>
        <span>{formatRelativeDate(project.updatedAt)}</span>
      </div>
    </Link>
  )
}
