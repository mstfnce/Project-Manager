import { FolderKanban, ListChecks, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '@/api/dashboard'
import { getProjects } from '@/api/projects'
import { statusColors, statusLabels } from '@/components/ProjectCard'

// Ust siradaki 3 kutunun ortak ikon/renk deseni - hepsi ayni rozet
// stilinde (index.css token'lari), sadece ikon degisiyor. Yeni hex
// uydurmuyoruz, bu sayfa icin mockup olmadigi icin mevcut token'lara
// sadik kaliyoruz (bkz. CLAUDE.md "renk" kurali).
const statCards = [
  { key: 'totalProjects', label: 'Toplam Proje', icon: FolderKanban },
  { key: 'activeProjects', label: 'Aktif Proje', icon: Rocket },
  { key: 'activeTaskCount', label: 'Aktif Görev', icon: ListChecks },
] as const

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  })

  // Sidebar zaten ayni ['projects'] anahtariyla veri cekiyor - bu sayfa
  // acilirken Sidebar da acik oldugu icin genelde React Query cache'ten
  // donuyor, ekstra istek olmuyor.
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })
  const projects = projectsData?.data ?? []

  if (isLoading) {
    return <div className="p-4 sm:p-8 text-muted-foreground">Yükleniyor...</div>
  }

  if (error) {
    return <div className="p-4 sm:p-8 text-destructive">Özet yüklenemedi.</div>
  }

  const summary = data?.data
  const upcomingDeadlines = summary?.upcomingDeadlines ?? []

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-heading">PDKS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Proje Denetleme Kontrol Sistemi — projelerini, görevlerini ve notlarını tek yerden takip et.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-2xl font-semibold text-heading">
                {summary?.[key] ?? 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-heading">Yaklaşan Son Tarihler</h2>

          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">Yaklaşan bir deadline yok.</p>
          ) : (
            <ul className="divide-y divide-border">
              {upcomingDeadlines.map((task) => {
                // TaskCard'daki isOverdue ile ayni mantik - bitmis gorev
                // burada zaten gorunmuyor (backend sadece acik gorevleri
                // dondurur), o yuzden isDone kontrolune gerek yok.
                const isOverdue = new Date(task.dueDate) < new Date()

                return (
                  <li key={task.taskId}>
                    <Link
                      to={`/projects/${task.projectId}`}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{task.taskTitle}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {task.projectName}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-medium ${
                          isOverdue ? 'text-destructive' : 'text-muted-foreground'
                        }`}
                      >
                        {isOverdue ? 'Gecikti · ' : ''}
                        {new Date(task.dueDate).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-heading">Proje İlerlemesi</h2>
            <Link to="/projects" className="text-xs font-medium text-brand hover:underline">
              Tümünü gör
            </Link>
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz proje yok.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {projects.map((project) => {
                // taskCount 0 olabilir (yeni acilmis proje) - 0'a bolme
                // yerine "henuz gorev yok" gosteriyoruz.
                const percent =
                  project.taskCount === 0
                    ? null
                    : Math.round((project.completedTaskCount / project.taskCount) * 100)

                return (
                  <li key={project.id}>
                    <Link to={`/projects/${project.id}`} className="block group">
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                          {project.name}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${statusColors[project.status]}`}
                        >
                          {statusLabels[project.status]}
                        </span>
                      </div>

                      {percent === null ? (
                        <p className="text-xs text-muted-foreground">Henüz görev yok</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-9 shrink-0 text-right text-xs text-muted-foreground">
                            {percent}%
                          </span>
                        </div>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
