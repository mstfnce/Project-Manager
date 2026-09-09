import type { ReactNode } from 'react'
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
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      {/* Topbar sabit kalsin, sadece altindaki icerik kaysin diye sag taraf
          kendi icinde dikey flex + main'de overflow-y-auto. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
