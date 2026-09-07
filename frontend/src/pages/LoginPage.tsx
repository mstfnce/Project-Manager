import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { AuthResponse, LoginRequest } from '@/types/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    // Formun kendi varsayilan davranisini (sayfayi yenileyip veriyi URL'e
    // eklemesini) engelliyoruz - istegi kendimiz axios ile atacagiz.
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const body: LoginRequest = { email, password }
      const response = await apiClient.post<AuthResponse>('/auth/login', body)
      localStorage.setItem('token', response.data.token)
      navigate('/dashboard')
    } catch {
      // Backend 401 donerse (yanlis email/sifre) buraya duser.
      setError('E-posta veya sifre hatali.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Giris Yap</h1>

        <div className="mb-4">
          <label htmlFor="email" className="mb-1.5 block text-sm text-slate-600">
            E-posta
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="mb-1.5 block text-sm text-slate-600">
            Sifre
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Giris yapiliyor...' : 'Giris Yap'}
        </Button>
      </form>
    </div>
  )
}
