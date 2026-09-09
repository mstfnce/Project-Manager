import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'

// Mockup'taki ust bar - Layout icinde Sidebar'in sagindaki icerigin en ustunde,
// tum korumali sayfalarda ayni.
export function Topbar() {
  const displayName = localStorage.getItem('displayName') ?? 'Kullanıcı'

  return (
    <header className="flex items-center gap-4 border-b border-border bg-background/85 px-8 py-4 backdrop-blur">
      {/* Arama kutusu simdilik sadece gorsel - ileride aktif edilecek. */}
      <div className="flex max-w-md flex-1 items-center gap-2 rounded-xl bg-muted px-3.5 py-2.5 text-[13px] text-faint">
        <Search className="size-[15px] shrink-0" />
        Proje, görev veya etiket ara...
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* ?new=1 - ProjectListPage bu parametreyi gorunce "yeni proje"
            modalini otomatik aciyor. */}
        <Link
          to="/projects?new=1"
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <Plus className="size-[15px]" />
          Yeni Proje
        </Link>

        <div className="grid size-[34px] place-items-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-[13px] font-bold text-primary-foreground">
          {displayName.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
