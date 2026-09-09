import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '@/api/dashboard'

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  })

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Yükleniyor...</div>
  }

  if (error) {
    return <div className="p-8 text-destructive">Özet yüklenemedi.</div>
  }

  const summary = data?.data
  const upcomingDeadlines = summary?.upcomingDeadlines ?? []

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Toplam Proje</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {summary?.totalProjects ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Aktif Proje</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {summary?.activeProjects ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Aktif Görev</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">
            {summary?.activeTaskCount ?? 0}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-foreground">Yaklaşan Son Tarihler</h2>

        {upcomingDeadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground">Yaklaşan bir deadline yok.</p>
        ) : (
          <ul className="divide-y divide-border">
            {upcomingDeadlines.map((task) => (
              <li
                key={task.taskId}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{task.taskTitle}</p>
                  <p className="text-xs text-muted-foreground">{task.projectName}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
