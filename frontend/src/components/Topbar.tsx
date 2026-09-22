import { Link, useLocation } from 'react-router-dom'
import { Menu, Plus, Search } from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
}

// Mockup'taki ust bar - Layout icinde Sidebar'in sagindaki icerigin en ustunde,
// tum korumali sayfalarda ayni.
export function Topbar({ onMenuClick }: TopbarProps) {
  const displayName = localStorage.getItem('displayName') ?? 'Kullanıcı'
  const location = useLocation()
  // Projeler sayfasinin kendi "+ Yeni Proje" butonu var - ikisi ayni anda
  // gorununce ayni islev iki kere gosteriliyordu, o yuzden orada gizliyoruz.
  const isProjectsPage = location.pathname === '/projects'

  return (
    <header className="flex items-center gap-3 border-b border-border bg-background/85 px-4 py-4 backdrop-blur md:gap-4 md:px-8">
      {/* Sidebar mobilde gizli oldugu icin acma butonu burada; md'den itibaren
          sidebar zaten gorunur, buton gereksiz. */}
      <button
        type="button"
        onClick={onMenuClick}
        title="Menüyü aç"
        aria-label="Menüyü aç"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-foreground/70 hover:bg-muted md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Arama kutusu simdilik sadece gorsel - ileride aktif edilecek. Islevi
          olmadigi icin dar ekranda yer kaplamasin diye gizleniyor. */}
      <div className="hidden max-w-md flex-1 items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5 text-[13px] text-faint sm:flex">
        <Search className="size-[15px] shrink-0" />
        Proje, görev veya etiket ara...
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* ?new=1 - ProjectListPage bu parametreyi gorunce "yeni proje"
            modalini otomatik aciyor. */}
        {!isProjectsPage && (
          <Link
            to="/projects?new=1"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm hover:bg-primary/90 sm:px-4"
          >
            <Plus className="size-[15px]" />
            <span className="hidden sm:inline">Yeni Proje</span>
          </Link>
        )}

        <div className="grid size-[34px] place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-[13px] font-bold text-primary-foreground">
          {displayName.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
