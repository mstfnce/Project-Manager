# Proje Takip Sistemi — Yol Haritası

> Bu dosya **canlı** bir belgedir. Her adım bitince `[ ]` → `[x]` yapılır,
> öğrenilen şey "Öğrenme Durağı Notları" bölümüne not düşülür.
> Kural: **bir bölüm tamamen bitmeden sonrakine geçilmez.**

**Stack:** .NET 10 Web API + PostgreSQL + React (Vite + TS + Tailwind)
**Yaklaşım:** Clean Architecture, adım adım, her adımda önce anlatım → karar → kod

**Simgeler:**
- `🎓` = Öğrenme durağı (kod yazılmaz, kavram anlaşılır)
- `❓` = Birlikte karar verilecek nokta
- `✅` = Doğrulama adımı ("bitti"nin kanıtı)

---

## Bölüm 0 — Ortam Hazırlığı

- [x] **0.1 Araç envanteri çıkar**
  - [x] .NET 10 SDK kurulu mu? **10.0.300** ✅ (`dotnet --list-sdks`)
  - [x] Node.js (LTS, 20+) kurulu mu? **v22.20.0** ✅ (`node --version`)
  - [~] Docker Desktop kurulu ve çalışıyor mu? **kurulu (29.7.2) ama daemon kapalı** ⚠️ (`docker --version`)
  - [x] Git kurulu mu? **2.54.0** ✅ (`git --version`)
  - [x] Editör: VS Code / Rider / Visual Studio — hangisi? → **VS Code**
- [x] **0.2 Eksik araçları kur**
  - [x] ~~.NET 10 SDK indir~~ — gerek yok
  - [x] ~~Node.js LTS indir~~ — gerek yok
  - [x] ~~Docker Desktop indir~~ — kurulu, sadece **Bölüm 3'te başlatılacak**
- [x] **0.3 Editör eklentileri**
  - [x] C# Dev Kit (VS Code) — zaten kuruluydu
  - [x] REST Client (`.http` dosyalarını çalıştırmak için) — kuruldu
  - [x] Tailwind CSS IntelliSense — kuruldu
- [x] **0.4 Git deposu**
  - [x] `git init`
  - [x] `.gitignore` (dotnet + node + IDE + `.env`)
  - [x] İlk commit: "chore: proje iskeleti - backend solution ve 4 katman"
  - [x] GitHub remote bağlandı, `main` dalına push edildi (`github.com/mstfnce/Project-Manager`)
- [x] ✅ **Doğrulama:** tüm komutlar sürüm numarası döndürüyor

---

## Bölüm 1 — Kavramlar 🎓 (kod yazılmaz)

- [x] **1.1 Frontend / Backend ayrımı**
  - [x] İki ayrı sunucu, iki ayrı port, aralarında sadece HTTP + JSON
  - [x] Neden ayrı? (bağımsız deploy, farklı istemciler, ekip ayrımı)
  - [x] CORS nedir, neden geliştirmede sorun çıkarır
  - [x] Çalışma sırası kuralı: **önce backend bitir → Swagger'da test et → sonra frontend**
- [x] **1.2 REST ve endpoint mantığı**
  - [x] Kaynak (resource) düşüncesi: `/api/projects`, `/api/projects/5/tasks`
  - [x] HTTP fiilleri: GET / POST / PUT / PATCH / DELETE — hangisi ne zaman
  - [x] Durum kodları: 200 / 201 / 204 / 400 / 401 / 404 / 409 / 500
  - [x] PUT vs PATCH farkı (tamamını değiştir vs bir alanı değiştir)
- [x] **1.3 Clean Architecture**
  - [x] Bağımlılık kuralı: oklar **hep içeri** bakar — `using` satırı = bağımlılık, C# döngüsel referansa izin vermiyor (NU1108)
  - [x] `Domain` → hiçbir şeyi tanımaz (saf C#, EF Core bile yok)
  - [x] `Application` → Domain'i tanır, iş kurallarını barındırır; dış dünyaya `interface` ile ters bağlanır
  - [x] `Infrastructure` → dış dünya (veritabanı, HTTP, dosya, AI API)
  - [x] `Api` → en dış katman, HTTP'yi bilir, hepsini tanır
  - [x] "5 katmanlı mimari" tartışması: bize 4 yeter, neden? — tek veri kaynağı var, ayırmak KISS ihlali olurdu
- [x] **1.4 Kod standartları**
  - [x] KISS — en basit çalışan çözüm
  - [x] DRY — ama erken soyutlama DRY değil, borçtur (3 tekrar kuralı)
  - [x] SOLID — özellikle S (tek sorumluluk) ve D (bağımlılığı tersine çevir)
  - [x] İsimlendirme: C# PascalCase, TS camelCase, dosya adı = sınıf adı
- [x] ❓ **Karar:** katman sayısı ve proje isimleri kesinleşecek → **4 proje**: `ProjectManager.Domain` / `.Application` / `.Infrastructure` / `.Api`
- [x] ✅ **Doğrulama:** mimariyi kendi cümlelerinle bir kağıda çizebiliyorsun

---

## Bölüm 2 — Backend İskeleti

- [x] **2.1 Solution oluştur**
  - [x] `dotnet new sln -n ProjectManager`
  - [x] Solution nedir, `.sln` ne işe yarar 🎓
- [x] **2.2 Projeleri oluştur**
  - [x] `ProjectManager.Domain` (classlib)
  - [x] `ProjectManager.Application` (classlib)
  - [x] `ProjectManager.Infrastructure` (classlib)
  - [x] `ProjectManager.Api` (webapi)
- [x] **2.3 Proje referanslarını bağla**
  - [x] Application → Domain
  - [x] Infrastructure → Application
  - [x] Api → Application + Infrastructure
  - [x] Yanlış referans verirsek ne olur? (bağımlılık kuralı ihlali) 🎓
- [x] **2.4 Projeleri solution'a ekle**
- [x] **2.5 API'yi ilk kez çalıştır**
  - [x] `dotnet run` → varsayılan örnek endpoint'i gör (`/weatherforecast` JSON döndü, localhost:5259)
  - [x] `Program.cs` satır satır okunacak 🎓 (minimal hosting model)
  - [x] OpenAPI arayüzünü aç — not: .NET 10 şablonunda Swagger UI yok, sadece ham `/openapi/v1.json`; görsel arayüz Bölüm 3'te Swashbuckle ile eklenecek
- [x] ✅ **Doğrulama:** `dotnet build` hatasız, endpoint tarayıcıda/curl ile JSON dönüyor

---

## Bölüm 3 — Veritabanı ve EF Core

- [x] **3.1 PostgreSQL'i Docker ile ayağa kaldır**
  - [x] `docker-compose.yml` yaz (şimdilik **sadece** `db` servisi)
  - [x] Named volume nedir, veri neden kaybolmaz 🎓
  - [x] `docker compose up -d db`
  - [x] Bağlantıyı test et (`docker ps` ile port eşleşmesi doğrulandı)
  - [x] ❓ **Karar:** port → **5434** (5432 native Windows PostgreSQL servisiyle çakışıyordu — `password authentication failed` hatasıyla keşfedildi; 5433 zaten `stajyer-puantaj-postgres` tarafından kullanılıyor)
- [x] **3.2 EF Core paketlerini kur**
  - [x] `Npgsql.EntityFrameworkCore.PostgreSQL` → Infrastructure
  - [x] `Microsoft.EntityFrameworkCore.Design` → Api
  - [x] `dotnet tool install --global dotnet-ef` — **zaten kurulu (10.0.5)** ✅
  - [x] Hangi paket neden hangi katmana? 🎓
- [x] **3.3 Entity'leri yaz (Domain katmanı)**
  - [x] `Project`
  - [x] `TaskItem`
  - [x] `Note`
  - [x] `User`
  - [x] `RoadmapItem` (MVP kapsamına eklendi — projeye özel, iç içe checklist; `ParentId` self-reference, `Order` sıralama, ilerleme yüzdesi DB'de tutulmuyor, anlık hesaplanacak)
  - [x] Enum'lar: `ProjectStatus`, `WorkItemStatus`, `TaskPriority`, `NoteType`
  - [x] ❓ **Karar:** `Id` tipi — `int` mi `Guid` mi? → **`int`**
- [x] **3.4 DbContext ve konfigürasyon**
  - [x] `AppDbContext`
  - [x] `IEntityTypeConfiguration<T>` ile her entity için ayrı dosya
  - [x] Fluent API vs Data Annotation farkı 🎓
  - [x] İlişkiler: one-to-many, cascade delete (+ self-reference için `Restrict` — `RoadmapItem`)
- [x] **3.5 Bağlantı dizesi (connection string)**
  - [x] `appsettings.Development.json`
  - [x] Şifreyi repoya koymamak: `dotnet user-secrets` 🎓
  - [x] `AppDbContext`'i DI'a kaydet (`AddDbContext` + `UseNpgsql`) — `Program.cs`
- [x] **3.6 İlk migration**
  - [x] `dotnet ef migrations add InitialCreate`
  - [x] Üretilen dosyayı **oku** — ne yaptığını anla 🎓
  - [x] `dotnet ef database update`
  - [x] 🐛 Çözülen sorun: native Windows PostgreSQL servisi (`postgres.exe`) 5432'yi dolduruyordu, Docker ile çakışıyordu → port 5434'e taşındı
- [x] ✅ **Doğrulama:** veritabanında tablolar görünüyor (`\dt` ile 5 tablo + `__EFMigrationsHistory`)

---

## Bölüm 4 — Kimlik Doğrulama (Auth)

- [x] **4.1 JWT nedir** 🎓
  - [x] Token'ın 3 parçası (header.payload.signature)
  - [x] Neden cookie/session değil de token (SPA senaryosu)
  - [x] Token nerede saklanır, riskleri
- [x] **4.2 Paketler**
  - [x] `Microsoft.AspNetCore.Authentication.JwtBearer` → Api
  - [x] `BCrypt.Net-Next` (şifre hash'leme) → Infrastructure
  - [x] Hash vs şifreleme farkı 🎓
- [x] **4.3 Register endpoint** (`RegisterRequest`/`AuthResponse` DTO'ları, `IPasswordHasher`+`BCryptPasswordHasher`, `IUserRepository`+`UserRepository`, `AuthService`, `AuthController`, DI kayıtları)
  - [x] 🐛 Çözülen sorun: .NET 10 `webapi` şablonu Controller desteğini varsayılan açmıyor → `AddControllers()` + `MapControllers()` eklendi
  - [x] ✅ Uçtan uca test: `curl` ile kayıt (200), aynı email ile tekrar kayıt (409), veritabanında `PasswordHash` BCrypt formatında doğrulandı
- [x] **4.4 Login endpoint → token üret** (`ITokenGenerator`+`JwtTokenGenerator`, `LoginRequest` DTO, `AuthService.LoginAsync`, `AuthController.Login`, DI kaydı — uçtan uca test: doğru şifre 200+JWT, yanlış şifre 401)
- [x] **4.5 `[Authorize]` ile endpoint koru** (JWT authentication middleware, `GET api/auth/me` test endpoint'i — token'sız 401, token'lı 200 + claim'ler doğrulandı)
- [ ] **4.6 Swagger'a "Authorize" düğmesi ekle** — Bölüm 5'e ertelendi (Swashbuckle henüz kurulmadı, .NET 10 şablonunda görsel Swagger UI yok)
- [x] ❓ **Karar:** register kalıcı açık mı, tek kullanıcıdan sonra kapansın mı? → **B: ilk kullanıcıdan sonra otomatik kapanır** (`IUserRepository.AnyUsersExistAsync`)
- [ ] ✅ **Doğrulama:** Swagger'dan login → token → korumalı endpoint 200 dönüyor

---

## Bölüm 5 — CRUD Endpoint'leri (asıl backend işi)

- [x] **5.1 DTO kavramı** 🎓
  - [x] Entity'yi neden doğrudan döndürmüyoruz
  - [x] `CreateProjectRequest` / `ProjectResponse` ayrımı
  - [x] DTO'lar neden Infrastructure'da değil Application'da (`docs/notlar/interface-ve-composition-root.md`)
- [x] **5.2 Project CRUD** (`IProjectRepository`+`ProjectRepository`, `ProjectService`, `ProjectsController`, DI kayıtları)
  - [~] `GET /api/projects` — listeleme çalışıyor, **filtre (`?status=&search=`) henüz yok**
  - [x] `POST /api/projects` (201 + `CreatedAtAction`, slug otomatik üretiliyor; çakışırsa `-2`, `-3`)
  - [x] `GET /api/projects/{id}` (bulunamazsa 404) — **`tasks`/`notes` özeti henüz `Include` edilmiyor, sayılar 0 dönüyor**
  - [x] `PUT /api/projects/{id}`
  - [x] `DELETE /api/projects/{id}` (204 / 404)
  - [x] ✅ Uçtan uca curl testi: 201/200/404/204/401 doğrulandı, slug çakışması `test-projesi` → `test-projesi-2`
- [x] **5.3 Task CRUD**
  - [x] `GET /api/projects/{id}/tasks`
  - [x] `GET /api/tasks/{id}` (plandan fazla — düzenleme formu ve `CreatedAtAction` için gerekli)
  - [x] `POST /api/projects/{id}/tasks`
  - [x] `PUT /api/tasks/{id}`
  - [x] `PATCH /api/tasks/{id}/status` (kanban için)
  - [x] `DELETE /api/tasks/{id}`
  - [x] ✅ Uçtan uca curl testi: 201/200/404/204 doğrulandı, `CompletedAt` otomatik doldurma/temizleme mantığı doğrulandı
- [x] **5.4 Note CRUD**
  - [x] `GET /api/projects/{id}/notes`
  - [x] `GET /api/notes/{id}` (plandan fazla — Task'taki gerekçenin aynısı)
  - [x] `POST /api/projects/{id}/notes`
  - [x] `PUT /api/notes/{id}`
  - [x] `DELETE /api/notes/{id}`
  - [x] ✅ Uçtan uca curl testi: 201/200/404/204 doğrulandı, en yeni not üstte sıralanıyor
- [x] **5.5 Dashboard özeti**
  - [x] `GET /api/dashboard/summary` (toplam/aktif proje sayısı, aktif görev sayısı, ilk 5 yaklaşan deadline)
- [x] **5.6 Hata yönetimi**
  - [x] Global exception middleware (`IExceptionHandler` ile elle yazıldı, framework'ün hazır mekanizması yerine)
  - [x] `ProblemDetails` (RFC 7807) standardı 🎓
- [x] **5.7 Doğrulama (validation)**
  - [x] FluentValidation kurulumu (7 request DTO'su için validator, ortak enum doğrulama yardımcısı)
  - [x] Boş isim/içerik, geçersiz enum ve geçmiş `DueDate` kuralları — hepsi curl ile 400/201 ayrımı doğrulandı
- [ ] **5.8 `.http` dosyası ile test**
  - [ ] Her endpoint için istek yaz, elle çalıştır (şimdiye kadar curl ile test edildi, `.http` dosyası henüz yazılmadı)
- [ ] ✅ **Doğrulama:** tüm CRUD `.http` üzerinden çalışıyor — backend MVP tamam

---

## Bölüm 6 — Frontend İskeleti

- [x] **6.1 Proje oluştur**
  - [x] `npm create vite@latest frontend -- --template react-ts`
  - [x] Vite nedir, CRA'dan farkı 🎓
- [~] **6.2 Tailwind kurulumu**
  - [x] `tailwindcss` kur + `index.css` yapılandır (`@tailwindcss/vite` plugin + `@import "tailwindcss"`)
  - [x] Utility-first yaklaşımı 🎓
  - [ ] Dark mode (`class` stratejisi) baştan ayarla
- [x] **6.3 Temel bağımlılıklar**
  - [x] `react-router-dom` (sayfa yönlendirme)
  - [x] `axios` (HTTP istemcisi)
  - [x] `@tanstack/react-query` (sunucu verisi yönetimi) 🎓
  - [x] ❓ **Karar:** shadcn/ui kullanalım mı, bileşenleri elle mi yazalım? → **shadcn/ui** (kod projeye kopyalanıyor, node_modules'e gizli bağımlılık değil; erişilebilirlik detaylarını sıfırdan yazmaktan kurtarıyor). `@/*` path alias `tsconfig`+`vite.config.ts`'e eklendi, `npx shadcn init` çalıştırıldı.
- [x] **6.4 Klasör yapısı**
  - [x] `api/ types/ hooks/ components/ pages/ lib/`
- [x] **6.5 API istemcisi**
  - [x] axios instance + `baseURL` (`src/api/client.ts`)
  - [x] Interceptor ile token ekleme
  - [x] 401 → login'e yönlendirme
- [x] **6.6 CORS'u backend'de aç**
  - [x] Neden gerekli, neden Docker aşamasında gerekmeyecek 🎓 (`Program.cs`'e `Frontend` policy'si eklendi — `localhost:5173`'e izin veriyor)
- [x] **6.7 Login sayfası** (`src/pages/LoginPage.tsx` — form, axios ile `/auth/login`, token `localStorage`'a kaydediliyor)
- [x] **6.8 Korumalı route (`ProtectedRoute`)** (`src/components/ProtectedRoute.tsx` — token yoksa `/login`'e yönlendiriyor, `/dashboard` bununla sarıldı)
- [x] ✅ **Doğrulama:** tarayıcıdan login → token alınıyor → boş dashboard açılıyor (test kullanıcısıyla uçtan uca doğrulandı)

---

## Bölüm 7 — Dashboard ve Proje Ekranları

- [ ] **7.1 Proje listesi sayfası**
- [ ] **7.2 Proje kartı bileşeni** (durum rozeti, ilerleme çubuğu)
- [ ] **7.3 Proje oluştur / düzenle formu**
  - [ ] `react-hook-form` + `zod` ile doğrulama
- [ ] **7.4 Dashboard özet ekranı**
  - [ ] Aktif proje sayısı, açık görevler, yaklaşan son tarihler
- [ ] **7.5 Bileşen ayrıştırma** 🎓 (ne zaman ayrı bileşen yapılır — DRY/KISS)
- [ ] ✅ **Doğrulama:** proje oluştur → listede gör → düzenle → sil

---

## Bölüm 8 — Kanban Board ve Notlar

- [ ] **8.1 Kanban kavramı** 🎓 (kolonlar = durumlar)
- [ ] **8.2 Board bileşeni** (4 kolon: Todo / InProgress / Blocked / Done)
- [ ] **8.3 Sürükle-bırak**
  - [ ] `@dnd-kit` kurulumu
  - [ ] Bırakınca `PATCH /tasks/{id}/status` çağrısı
  - [ ] Optimistic update nedir 🎓
- [ ] **8.4 Görev ekleme / düzenleme modalı**
- [ ] **8.5 Not listesi ve markdown editörü**
  - [ ] `react-markdown` ile önizleme
  - [ ] Tip ve etiket filtresi
- [ ] ✅ **Doğrulama:** MVP tamam — proje aç, görev ekle, sürükle, not yaz

---

## Bölüm 9 — AI Context Katmanı (henüz chat yok)

- [ ] **9.1 `ProjectContextBuilder`**
  - [ ] Projeyi + görevleri + notları tek bir Markdown metnine çevirir
  - [ ] Neden tek kaynak? (hem web hem Claude aynı metni görsün) 🎓
- [ ] **9.2 `GET /api/projects/{id}/context`** → `text/markdown`
- [ ] **9.3 `GET /api/projects/slug/{slug}/context`**
- [ ] ❓ **Karar:** context'e neler dahil, ne kadar geçmiş (son N görev/not)
- [ ] ✅ **Doğrulama:** tarayıcıda endpoint'i aç, okunabilir bir proje özeti gör

---

## Bölüm 10 — AI Entegrasyonu

- [ ] **10.1 `IAiProvider` arayüzü** (Application katmanı)
  - [ ] Bağımlılığı tersine çevirme (SOLID'in D'si) — canlı örnek 🎓
- [ ] **10.2 Sağlayıcı seçimi**
  - [ ] ❓ **Karar:** Gemini / Groq / OpenRouter — hangisi varsayılan?
  - [ ] API anahtarı al, `user-secrets`'a koy
- [ ] **10.3 Sağlayıcı implementasyonu**
  - [ ] `IHttpClientFactory` ile typed client 🎓
- [ ] **10.4 Sohbet kalıcılığı**
  - [ ] `AiConversation` + `AiMessage` entity'leri + migration
- [ ] **10.5 Endpoint'ler**
  - [ ] `POST /api/projects/{id}/ai/ask`
  - [ ] `GET /api/projects/{id}/ai/conversations`
- [ ] **10.6 Rate limit** (ücretsiz kotayı korumak için)
- [ ] **10.7 Frontend chat paneli**
- [ ] ✅ **Doğrulama:** "bu projede sırada ne yapmalıyım?" sorusuna, gerçek
      görevlerine atıf yapan bir cevap geliyor

---

## Bölüm 11 — Docker ve Deployment

- [ ] **11.1 Backend `Dockerfile`** (multi-stage build) 🎓
- [ ] **11.2 Frontend `Dockerfile`** (node build → nginx serve)
- [ ] **11.3 `docker-compose.yml`'i tamamla** (db + api + frontend)
- [ ] **11.4 Nginx reverse proxy** (`/api` → api servisi, CORS sorunu biter)
- [ ] **11.5 `.env` / `.env.example`**
- [ ] **11.6 Migration stratejisi** (üretimde otomatik migration riski) 🎓
- [ ] ✅ **Doğrulama:** temiz makinede `docker compose up -d` → sistem çalışıyor

---

## Bölüm 12 — Testler (en son)

- [ ] **12.1 Test türleri** 🎓 (unit / integration / e2e)
- [ ] **12.2 xUnit projesi kur**
- [ ] **12.3 `ProjectContextBuilder` birim testi**
- [ ] **12.4 Görev durum geçişi testleri**
- [ ] **12.5 Testcontainers ile entegrasyon testi**
- [ ] ✅ **Doğrulama:** `dotnet test` yeşil

---

## Bekleyen Kararlar ❓

| # | Bölüm | Karar | Durum |
|---|-------|-------|-------|
| 1 | 1.3 | Katman sayısı ve proje isimleri | ✅ 4 proje: Domain/Application/Infrastructure/Api |
| 2 | 3.1 | PostgreSQL portu | ✅ 5434 |
| 3 | 3.3 | `Id` tipi: `int` mi `Guid` mi | ✅ `int` |
| 4 | 4.6 | Register kalıcı açık mı | ✅ B: ilk kullanıcıdan sonra kapanır |
| 5 | 6.3 | shadcn/ui vs elle bileşen | Açık |
| 6 | 9.3 | Context kapsamı | Açık |
| 7 | 10.2 | AI sağlayıcı | Açık |

---

## MVP Sonrası Fikirler (henüz plana alınmadı)

- **n8n entegrasyonu** — workflow otomasyonu için ayrı bir servis olarak eklenebilir.
  Muhtemel kullanım: Bölüm 10 (AI) sonrası, örn. "her sabah açık görevleri özetleyip
  bildirim gönder" gibi zamanlanmış/webhook tetiklemeli otomasyonlar. Şimdilik
  MVP kapsamı dışında (YAGNI) — CRUD bile bitmeden eklenmeyecek.

---

## Çalışma Ritmi (nerede ne zaman çalışıyoruz)

| Aşama | Nerede | Neden |
|---|---|---|
| Bölüm 0–5 | **Backend** | Frontend backend'e bağımlı; önce API bitirilir |
| Bölüm 6–8 | **Frontend** | API hazır, artık ekran çizilebilir |
| Bölüm 9–10 | **Önce backend, sonra frontend** | Context + AI endpoint'i → sonra chat ekranı |
| Bölüm 11 | **Her ikisi + Docker** | Paketleme aşaması |
| Bölüm 12 | **Backend** | Testler |

**Docker ne zaman?**
- **Bölüm 3'te:** sadece PostgreSQL için (`docker compose up -d db`). Bir kere kurulur, hep açık kalır.
- **Bölüm 11'de:** kendi uygulamanı paketlemek için. Geliştirme boyunca API `dotnet run`, frontend `npm run dev` ile çalışır (hot-reload lazım).
- **Ne zaman güncellenir?** `docker-compose.yml`'e yeni servis eklediğinde veya `Dockerfile`'daki bağımlılıklar değiştiğinde `docker compose up -d --build`.

---

## Öğrenme Durağı Notları

> Her `🎓` bittiğinde buraya kendi cümlelerinle 2–3 satır not düş.
> Amaç: 3 ay sonra okuyunca hatırlamak.

_(henüz boş)_
