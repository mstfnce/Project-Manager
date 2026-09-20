# PDKS — Proje Denetleme Kontrol Sistemi

Projelerini, görevlerini ve notlarını tek yerden takip etmek için yazılmış
bir proje denetleme kontrol uygulaması. Aynı zamanda modern web geliştirme
pratiklerini adım adım öğrenmek için yürütülen bir çalışma — yol haritası
`ROADMAP.md`'de.

**Teknolojiler:** .NET 10 Web API (Clean Architecture) · PostgreSQL + EF Core ·
JWT kimlik doğrulama · React + TypeScript + Vite · Tailwind CSS + shadcn/ui ·
TanStack Query

## Neler var

- Proje oluşturma/düzenleme, durum takibi (Planlama, Aktif, Duraklatıldı,
  Tamamlandı, Arşivlendi) ve tamamlanma yüzdesi
- Görevler: kanban panosu (sürükle-bırak), düz liste, ana görev/alt görev
- Notlar: markdown destekli, türe ve projeye göre filtrelenebilir
- Dashboard: aktif proje ve görev sayıları, yaklaşan son tarihler

## Gereksinimler

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (yalnızca PostgreSQL için)

## Kurulum (bir kereye mahsus)

**1. Veritabanını başlat**

```bash
docker compose up -d db
```

PostgreSQL `localhost:5434`'te açılır (kullanıcı/şifre/veritabanı: `projectmanager`).
Container `restart: unless-stopped` ile çalışır, yani bundan sonra Docker Desktop
açıldığında kendiliğinden kalkar.

**2. Gizli ayarları gir**

Bağlantı dizesi ve JWT anahtarı `appsettings.json`'da değil, .NET'in
[user-secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets)
deposunda tutulur — bu dosyalar git'e girmez.

```bash
cd backend/src/ProjectManager.Api

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5434;Database=projectmanager;Username=projectmanager;Password=projectmanager"

dotnet user-secrets set "Jwt:Key"      "en-az-32-karakterlik-rastgele-bir-anahtar-yaz"
dotnet user-secrets set "Jwt:Issuer"   "ProjectManager"
dotnet user-secrets set "Jwt:Audience" "ProjectManagerClient"
```

`Jwt:Key` en az 32 karakter olmalı; token 7 gün geçerlidir.

**3. Veritabanı tablolarını oluştur**

```bash
dotnet ef database update
```

**4. Frontend bağımlılıkları**

```bash
cd frontend
npm install
```

## Çalıştırma

Kökten tek komut — veritabanını kontrol eder, backend ve frontend'i ayrı
pencerelerde açar:

```powershell
.\start.ps1
```

> Windows script çalıştırmayı engellerse bir kereye mahsus:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

Elle başlatmak istersen:

```bash
cd backend/src/ProjectManager.Api && dotnet watch run   # http://localhost:5259
cd frontend && npm run dev                              # http://localhost:5173
```

## İlk giriş

Sistem tek kullanıcılıdır: **ilk kayıttan sonra register kapanır.** İlk
kullanıcıyı oluşturmak için:

```powershell
curl.exe -X POST http://localhost:5259/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"sen@ornek.com\",\"password\":\"Sifre123!\",\"displayName\":\"Adin\"}"
```

> PowerShell'de `curl` aslında `Invoke-WebRequest`'in takma adıdır, o yüzden
> `curl.exe` yazmak gerekiyor.

Sonra `http://localhost:5173` adresinden bu bilgilerle giriş yap.

## Proje yapısı

```
backend/src/
  ProjectManager.Domain/          entity'ler, enum'lar - hiçbir şeye bağımlı değil
  ProjectManager.Application/     servisler, DTO'lar, arayüzler (iş kuralları)
  ProjectManager.Infrastructure/  EF Core, repository'ler, JWT üretimi
  ProjectManager.Api/             controller'lar, middleware, Program.cs
frontend/src/
  api/         axios istemcisi ve endpoint fonksiyonları
  components/  yeniden kullanılan bileşenler
  pages/       sayfa bileşenleri
  types/       backend DTO'larının TypeScript karşılıkları
docs/
  notlar/      öğrenme notları
  planlar/     özellik bazlı planlar
  design/      tasarım mockup'ları
```

## Notlar

- API adresi şu an `frontend/src/api/client.ts` içinde sabit
  (`http://localhost:5259/api`). Dağıtım aşamasında ortam değişkenine taşınacak
  (ROADMAP Bölüm 11).
- CORS yalnızca `http://localhost:5173` adresine açık. Vite başka bir porta
  düşerse istekler engellenir.
- Geliştirme sırasında backend ve frontend host makinede çalışır; Docker
  yalnızca veritabanı için kullanılır (hot reload gerektiği için).
