import type { ReactNode } from 'react'
import { Sidebar } from '@/components/Sidebar'

interface LayoutProps {
  children: ReactNode
}

// Korumali her sayfayi (Dashboard, ProjectList, ProjectDetail) bu sarmaliyor -
// sol tarafta sabit Sidebar, sagda o an hangi sayfadaysak onun icerigi.
export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
