import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  StickyNote,
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

  // Sidebar katlanmis mi? Her route kendi Layout'unu render ettigi icin sayfa
  // degisince bu component yeniden mount oluyor - tercih kaybolmasin diye
  // localStorage'da tutuyoruz.
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === '1',
  )

  function toggleCollapsed() {
    setIsCollapsed((collapsed) => {
      const next = !collapsed
      localStorage.setItem('sidebarCollapsed', next ? '1' : '0')
      return next
    })
  }

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
    <aside
      className={`flex h-screen flex-shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 transition-[width] ${
        isCollapsed ? 'w-[72px]' : 'w-60'
      }`}
    >
      {/* Katliyken 72px'e logo + buton yan yana sigmiyordu (buton eziliyordu),
          o yuzden katliyken alt alta diziliyorlar. */}
      <div
        className={`flex gap-2.5 px-1 ${
          isCollapsed ? 'flex-col items-center' : 'items-center'
        }`}
      >
        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sm font-extrabold text-sidebar-primary-foreground">
          T
        </div>
        {!isCollapsed && (
          <span className="text-[15px] font-bold text-sidebar-foreground">Takip</span>
        )}

        <button
          type="button"
          onClick={toggleCollapsed}
          title={isCollapsed ? 'Menüyü aç' : 'Menüyü kapat'}
          className={`grid size-8 flex-shrink-0 place-items-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground ${
            isCollapsed ? '' : 'ml-auto'
          }`}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="size-[17px]" />
          ) : (
            <PanelLeftClose className="size-[17px]" />
          )}
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        <Link
          to="/dashboard"
          title="Dashboard"
          className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold transition-colors ${
            isCollapsed ? 'justify-center' : ''
          } ${
            location.pathname === '/dashboard'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
          }`}
        >
          <LayoutDashboard className="size-[17px] shrink-0" />
          {!isCollapsed && 'Dashboard'}
        </Link>

        <Link
          to="/projects"
          title="Projeler"
          onClick={() => setIsProjectsOpen(true)}
          className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold transition-colors ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } ${
            location.pathname.startsWith('/projects')
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <FolderKanban className="size-[17px] shrink-0" />
            {!isCollapsed && 'Projeler'}
          </span>
          {!isCollapsed && (
            <ChevronDown
              className={`size-[13px] shrink-0 transition-transform ${isProjectsOpen ? 'rotate-180' : ''}`}
              onClick={(e) => {
                // Link'in navigasyonunu tetiklemeden sadece acilir listeyi
                // ac/kapa - "Projeler" yazisina tiklamak /projects'e gitsin,
                // oka tiklamak sadece listeyi katlasin/acsin.
                e.preventDefault()
                e.stopPropagation()
                setIsProjectsOpen((open) => !open)
              }}
            />
          )}
        </Link>

        {/* Katlanmis halde proje alt listesi gizleniyor - 72px'e sigmaz. */}
        {isProjectsOpen && !isCollapsed && (
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
          </div>
        )}

        {/* Global Notlar sayfasi - tum projelerin notlari bir arada. */}
        <Link
          to="/notes"
          title="Notlar"
          className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold transition-colors ${
            isCollapsed ? 'justify-center' : ''
          } ${
            location.pathname === '/notes'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
          }`}
        >
          <StickyNote className="size-[17px] shrink-0" />
          {!isCollapsed && 'Notlar'}
        </Link>

        <div
          title="Analiz (yakında)"
          className={`flex cursor-default items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold text-sidebar-foreground/40 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <BarChart3 className="size-[17px] shrink-0" />
            {!isCollapsed && 'Analiz'}
          </span>
          {!isCollapsed && (
            <span className="rounded-full bg-sidebar-accent px-1.5 py-0.5 text-[9.5px] font-bold tracking-wide text-sidebar-foreground/50">
              YAKINDA
            </span>
          )}
        </div>
      </nav>

      <div className="flex flex-col gap-1">
        {!isCollapsed && (
          <span className="px-2.5 text-[10.5px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
            Genel
          </span>
        )}
        {/* Ayarlar icin henuz bir sayfa/route yok - ROADMAP'te de planlanmadi,
            simdilik sadece gorsel, tiklanamaz. */}
        <div
          title="Ayarlar"
          className={`flex cursor-default items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-semibold text-sidebar-foreground/70 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <Settings className="size-[17px] shrink-0" />
          {!isCollapsed && 'Ayarlar'}
        </div>
      </div>

      <div
        className={`mt-auto flex items-center gap-2.5 rounded-xl bg-sidebar-accent p-2.5 ${
          isCollapsed ? 'flex-col' : ''
        }`}
      >
        <div
          title={displayName}
          className="flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-xs font-bold text-sidebar-primary-foreground"
        >
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.8px] font-bold text-sidebar-foreground">
              {displayName}
            </div>
            <div className="truncate text-[11px] text-sidebar-foreground/50">{email}</div>
          </div>
        )}
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
