import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '@/api/dashboard'

export function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  })

  if (isLoading) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>
  }

  if (error) {
    return <div className="p-8 text-red-600">Özet yüklenemedi.</div>
  }

  const summary = data?.data
  const upcomingDeadlines = summary?.upcomingDeadlines ?? []

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Toplam Proje</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {summary?.totalProjects ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Aktif Proje</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {summary?.activeProjects ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Aktif Görev</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {summary?.activeTaskCount ?? 0}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-900">Yaklaşan Son Tarihler</h2>

        {upcomingDeadlines.length === 0 ? (
          <p className="text-sm text-slate-500">Yaklaşan bir deadline yok.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcomingDeadlines.map((task) => (
              <li
                key={task.taskId}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{task.taskTitle}</p>
                  <p className="text-xs text-slate-400">{task.projectName}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-500">
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
