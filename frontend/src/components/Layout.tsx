import { useState, type ReactNode } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { Topbar } from '@/components/Topbar'

interface LayoutProps {
  children: ReactNode
}

// Korumali her sayfayi (Dashboard, ProjectList, ProjectDetail) bu sarmaliyor -
// sol tarafta sabit Sidebar, sagda o an hangi sayfadaysak onun icerigi.
//
// h-screen + overflow-hidden disarida: sayfanin tamami hicbir zaman scroll
// olmaz, boylece Sidebar da hep yerinde kalir. overflow-y-auto main'de:
// icerik ekran boyundan uzunsa sadece main kendi icinde kayar, Sidebar'a
// dokunmaz.
export function Layout({ children }: LayoutProps) {
  // Dar ekranda sidebar 240px ile ekranin ucte ikisini yiyordu; mobilde
  // akistan cikip icerigin ustune aciliyor. Durum burada duruyor cunku hem
  // Sidebar'in (kendini gostermek) hem Topbar'in (hamburger butonu) erismesi
  // gerekiyor. md'den itibaren bu deger hic kullanilmiyor.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar acikken arkasini karartip tiklaninca kapatiyor. Masaustunde
          sidebar zaten hep gorunur oldugu icin md:hidden. */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Topbar sabit kalsin, sadece altindaki icerik kaysin diye sag taraf
          kendi icinde dikey flex + main'de overflow-y-auto. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
