import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  // Bu component'in icine ne konursa (orn. <DashboardPage />) onu kabul eder.
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Login basarili olunca LoginPage bu anahtarla token'i kaydetmisti.
  const token = localStorage.getItem('token')

  if (!token) {
    // Token yok -> giris yapilmamis. Sarili sayfayi (children) hic
    // render etmeden login'e yonlendir. "replace": tarayici gecmisine
    // bu adimi eklemez, geri tusu korumali sayfaya geri donmeye calismaz.
    return <Navigate to="/login" replace />
  }

  // Token var -> sarili sayfayi oldugu gibi goster.
  return children
}
