import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
} from 'lucide-react'
import { getProjects } from '@/api/projects'

// Sidebar tum korumali sayfalarda ayni - Layout.tsx bunu her sayfanin
// soluna sabit olarak yerlestiriyor.
export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  // "Projeler" linki tiklaninca acilip kapanan bir accordion - baslangicta
  // acik, cunku zaten projelerle ilgili bir sayfadaysak listeyi hemen gormek isteriz.
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)

  const { data } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })
  const projects = data?.data ?? []

  // Login sirasinda LoginPage.tsx bunlari localStorage'a yazmisti - JWT'nin
  // kendisinde DisplayName yok (sadece Email var), o yuzden JWT cozmek yerine
  // login cevabindan gelen degeri dogrudan kullaniyoruz.
  const displayName = localStorage.getItem('displayName') ?? 'Kullanıcı'
  const email = localStorage.getItem('email') ?? ''

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('displayName')
    localStorage.removeItem('email')
    navigate('/login')
  }

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4">
      <div className="flex items-center gap-2.5 px-1">
        <div className="flex size-8 items-center justify-center rounded-xl bg-sidebar-primary text-sm font-extrabold text-sidebar-primary-foreground">
          T
        </div>
        <span className="text-[15px] font-bold text-sidebar-foreground">Takip</span>
      </div>

      <nav className="flex flex-col gap-1">
        <Link
          to="/dashboard"
          className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold transition-colors ${
            location.pathname === '/dashboard'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
          }`}
        >
          <LayoutDashboard className="size-[17px]" />
          Dashboard
        </Link>

        <button
          type="button"
          onClick={() => setIsProjectsOpen((open) => !open)}
          className={`flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold transition-colors ${
            location.pathname.startsWith('/projects')
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <FolderKanban className="size-[17px]" />
            Projeler
          </span>
          <ChevronDown
            className={`size-[13px] transition-transform ${isProjectsOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isProjectsOpen && (
          <div className="flex flex-col gap-0.5 py-0.5 pl-7">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[12.8px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-sidebar-foreground/40" />
                  {project.name}
                </span>
                <span className="text-[11px] text-sidebar-foreground/50">
                  {project.taskCount}
                </span>
              </Link>
            ))}
            <Link
              to="/projects"
              className="mt-0.5 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.8px] font-semibold text-accent-foreground hover:bg-sidebar-accent"
            >
              <Plus className="size-[13px]" />
              Yeni proje
            </Link>
          </div>
        )}

        <div className="flex cursor-default items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold text-sidebar-foreground/40">
          <span className="flex items-center gap-2.5">
            <BarChart3 className="size-[17px]" />
            Analiz
          </span>
          <span className="rounded-full bg-sidebar-accent px-1.5 py-0.5 text-[9.5px] font-bold tracking-wide text-sidebar-foreground/50">
            YAKINDA
          </span>
        </div>
      </nav>

      <div className="flex flex-col gap-1">
        <span className="px-2.5 text-[10.5px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
          Genel
        </span>
        {/* Ayarlar icin henuz bir sayfa/route yok - ROADMAP'te de planlanmadi,
            simdilik sadece gorsel, tiklanamaz. */}
        <div className="flex cursor-default items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold text-sidebar-foreground/70">
          <Settings className="size-[17px]" />
          Ayarlar
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-sidebar-accent p-2.5">
        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-xs font-bold text-sidebar-primary-foreground">
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.8px] font-bold text-sidebar-foreground">
            {displayName}
          </div>
          <div className="truncate text-[11px] text-sidebar-foreground/50">{email}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Oturumu Kapat"
          className="flex size-7 flex-shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/50 hover:text-destructive"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  )
}
