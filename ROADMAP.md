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

- [ ] **0.1 Araç envanteri çıkar**
  - [x] .NET 10 SDK kurulu mu? **10.0.300** ✅ (`dotnet --list-sdks`)
  - [x] Node.js (LTS, 20+) kurulu mu? **v22.20.0** ✅ (`node --version`)
  - [~] Docker Desktop kurulu ve çalışıyor mu? **kurulu (29.7.2) ama daemon kapalı** ⚠️ (`docker --version`)
  - [x] Git kurulu mu? **2.54.0** ✅ (`git --version`)
  - [ ] Editör: VS Code / Rider / Visual Studio — hangisi?
- [ ] **0.2 Eksik araçları kur**
  - [x] ~~.NET 10 SDK indir~~ — gerek yok
  - [x] ~~Node.js LTS indir~~ — gerek yok
  - [x] ~~Docker Desktop indir~~ — kurulu, sadece **Bölüm 3'te başlatılacak**
- [ ] **0.3 Editör eklentileri**
  - [ ] C# Dev Kit (VS Code)
  - [ ] REST Client (`.http` dosyalarını çalıştırmak için)
  - [ ] Tailwind CSS IntelliSense
- [ ] **0.4 Git deposu**
  - [ ] `git init`
  - [ ] `.gitignore` (dotnet + node + IDE + `.env`)
  - [ ] İlk commit: "chore: proje iskeleti"
- [ ] ✅ **Doğrulama:** tüm komutlar sürüm numarası döndürüyor

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

- [ ] **3.1 PostgreSQL'i Docker ile ayağa kaldır**
  - [ ] `docker-compose.yml` yaz (şimdilik **sadece** `db` servisi)
  - [ ] Named volume nedir, veri neden kaybolmaz 🎓
  - [ ] `docker compose up -d db`
  - [ ] Bağlantıyı test et (DBeaver / pgAdmin / `psql`)
  - [ ] ❓ **Karar:** port (5432 mi 5433 mü — çakışma var mı?)
- [ ] **3.2 EF Core paketlerini kur**
  - [ ] `Npgsql.EntityFrameworkCore.PostgreSQL` → Infrastructure
  - [ ] `Microsoft.EntityFrameworkCore.Design` → Api
  - [x] `dotnet tool install --global dotnet-ef` — **zaten kurulu (10.0.5)** ✅
  - [ ] Hangi paket neden hangi katmana? 🎓
- [ ] **3.3 Entity'leri yaz (Domain katmanı)**
  - [ ] `Project`
  - [ ] `TaskItem`
  - [ ] `Note`
  - [ ] `User`
  - [ ] Enum'lar: `ProjectStatus`, `WorkItemStatus`, `TaskPriority`, `NoteType`
  - [ ] ❓ **Karar:** `Id` tipi — `int` mi `Guid` mi?
- [ ] **3.4 DbContext ve konfigürasyon**
  - [ ] `AppDbContext`
  - [ ] `IEntityTypeConfiguration<T>` ile her entity için ayrı dosya
  - [ ] Fluent API vs Data Annotation farkı 🎓
  - [ ] İlişkiler: one-to-many, cascade delete
- [ ] **3.5 Bağlantı dizesi (connection string)**
  - [ ] `appsettings.Development.json`
  - [ ] Şifreyi repoya koymamak: `dotnet user-secrets` 🎓
- [ ] **3.6 İlk migration**
  - [ ] `dotnet ef migrations add InitialCreate`
  - [ ] Üretilen dosyayı **oku** — ne yaptığını anla 🎓
  - [ ] `dotnet ef database update`
- [ ] ✅ **Doğrulama:** veritabanında tablolar görünüyor

---

## Bölüm 4 — Kimlik Doğrulama (Auth)

- [ ] **4.1 JWT nedir** 🎓
  - [ ] Token'ın 3 parçası (header.payload.signature)
  - [ ] Neden cookie/session değil de token (SPA senaryosu)
  - [ ] Token nerede saklanır, riskleri
- [ ] **4.2 Paketler**
  - [ ] `Microsoft.AspNetCore.Authentication.JwtBearer`
  - [ ] `BCrypt.Net-Next` (şifre hash'leme)
  - [ ] Hash vs şifreleme farkı 🎓
- [ ] **4.3 Register endpoint**
- [ ] **4.4 Login endpoint → token üret**
- [ ] **4.5 `[Authorize]` ile endpoint koru**
- [ ] **4.6 Swagger'a "Authorize" düğmesi ekle**
- [ ] ❓ **Karar:** register kalıcı açık mı, tek kullanıcıdan sonra kapansın mı?
- [ ] ✅ **Doğrulama:** Swagger'dan login → token → korumalı endpoint 200 dönüyor

---

## Bölüm 5 — CRUD Endpoint'leri (asıl backend işi)

- [ ] **5.1 DTO kavramı** 🎓
  - [ ] Entity'yi neden doğrudan döndürmüyoruz
  - [ ] `CreateProjectRequest` / `ProjectResponse` ayrımı
- [ ] **5.2 Project CRUD**
  - [ ] `GET /api/projects` (listeleme + filtre)
  - [ ] `POST /api/projects`
  - [ ] `GET /api/projects/{id}`
  - [ ] `PUT /api/projects/{id}`
  - [ ] `DELETE /api/projects/{id}`
- [ ] **5.3 Task CRUD**
  - [ ] `GET /api/projects/{id}/tasks`
  - [ ] `POST /api/projects/{id}/tasks`
  - [ ] `PUT /api/tasks/{id}`
  - [ ] `PATCH /api/tasks/{id}/status` (kanban için)
  - [ ] `DELETE /api/tasks/{id}`
- [ ] **5.4 Note CRUD**
  - [ ] `GET /api/projects/{id}/notes`
  - [ ] `POST /api/projects/{id}/notes`
  - [ ] `PUT /api/notes/{id}`
  - [ ] `DELETE /api/notes/{id}`
- [ ] **5.5 Dashboard özeti**
  - [ ] `GET /api/dashboard/summary`
- [ ] **5.6 Hata yönetimi**
  - [ ] Global exception middleware
  - [ ] `ProblemDetails` (RFC 7807) standardı 🎓
- [ ] **5.7 Doğrulama (validation)**
  - [ ] FluentValidation kurulumu
  - [ ] Boş isim, geçersiz tarih vb. kuralları
- [ ] **5.8 `.http` dosyası ile test**
  - [ ] Her endpoint için istek yaz, elle çalıştır
- [ ] ✅ **Doğrulama:** tüm CRUD `.http` üzerinden çalışıyor — backend MVP tamam

---

## Bölüm 6 — Frontend İskeleti

- [ ] **6.1 Proje oluştur**
  - [ ] `npm create vite@latest frontend -- --template react-ts`
  - [ ] Vite nedir, CRA'dan farkı 🎓
- [ ] **6.2 Tailwind kurulumu**
  - [ ] `tailwindcss` kur + `index.css` yapılandır
  - [ ] Utility-first yaklaşımı 🎓
  - [ ] Dark mode (`class` stratejisi) baştan ayarla
- [ ] **6.3 Temel bağımlılıklar**
  - [ ] `react-router-dom` (sayfa yönlendirme)
  - [ ] `axios` (HTTP istemcisi)
  - [ ] `@tanstack/react-query` (sunucu verisi yönetimi) 🎓
  - [ ] ❓ **Karar:** shadcn/ui kullanalım mı, bileşenleri elle mi yazalım?
- [ ] **6.4 Klasör yapısı**
  - [ ] `api/ types/ hooks/ components/ pages/ lib/`
- [ ] **6.5 API istemcisi**
  - [ ] axios instance + `baseURL`
  - [ ] Interceptor ile token ekleme
  - [ ] 401 → login'e yönlendirme
- [ ] **6.6 CORS'u backend'de aç**
  - [ ] Neden gerekli, neden Docker aşamasında gerekmeyecek 🎓
- [ ] **6.7 Login sayfası**
- [ ] **6.8 Korumalı route (`ProtectedRoute`)**
- [ ] ✅ **Doğrulama:** tarayıcıdan login → token alınıyor → boş dashboard açılıyor

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
| 2 | 3.1 | PostgreSQL portu | Açık |
| 3 | 3.3 | `Id` tipi: `int` mi `Guid` mi | Açık |
| 4 | 4.6 | Register kalıcı açık mı | Açık |
| 5 | 6.3 | shadcn/ui vs elle bileşen | Açık |
| 6 | 9.3 | Context kapsamı | Açık |
| 7 | 10.2 | AI sağlayıcı | Açık |

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
