import axios from 'axios'

// Backend adresi tek yerde tanımlı; diğer dosyalar sadece '/projects' gibi
// kısa yolları yazar, tam adresle uğraşmaz.
export const apiClient = axios.create({
  baseURL: 'http://localhost:5259/api',
})

// İstek backend'e gitmeden hemen önce araya girer: login sonrası
// localStorage'a kaydedilen token'ı otomatik olarak Authorization
// header'ına ekler, her çağrıda elle eklemek gerekmez.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Backend'den cevap geldikten sonra araya girer: 401 (token geçersiz/süresi
// dolmuş) gelirse eski token'ı temizler ve kullanıcıyı login'e yönlendirir.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
