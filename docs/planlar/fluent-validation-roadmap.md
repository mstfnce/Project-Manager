# FluentValidation — Ayrı Roadmap (Bölüm 5.7)

Task/Note/Dashboard'tan farklı: burada yeni bir "özellik" değil, var olan
tüm request DTO'larına **doğrulama katmanı** ekliyoruz. CRUD akışı değişmiyor,
sadece geçersiz veri artık controller'a ulaşmadan 400 ile reddediliyor.

## Neden

Şu an hiçbir DTO'da doğrulama yok: `Title = ""`, `Priority = "asdasd"` gibi
geçersiz veriler kabul ediliyor ya da `Enum.Parse` içeride patlayıp
(`GlobalExceptionHandler` sayesinde artık en azından temiz bir) 500
döndürüyor — ama bu istemci hatası, 400 olmalı.

## Doğrulanacak DTO'lar

| DTO | Kurallar (taslak) |
|---|---|
| `CreateProjectRequest` | `Name` boş olamaz, max 200 karakter |
| `UpdateProjectRequest` | `Name` boş olamaz; `Status` geçerli bir `ProjectStatus` değeri olmalı |
| `CreateTaskRequest` | `Title` boş olamaz, max 200; `Priority` geçerli bir `TaskPriority` değeri olmalı |
| `UpdateTaskRequest` | `Title` boş olamaz; `Priority` ve `Status` geçerli enum değerleri olmalı |
| `UpdateTaskStatusRequest` | `Status` geçerli bir `WorkItemStatus` değeri olmalı |
| `CreateNoteRequest` | `Title`/`Content` boş olamaz; `Type` geçerli bir `NoteType` değeri olmalı |
| `UpdateNoteRequest` | `Title`/`Content` boş olamaz; `Type` geçerli bir `NoteType` değeri olmalı |

Enum string'lerini doğrulamak için ortak bir yardımcı yazılabilir (ör.
`RuleFor(x => x.Priority).Must(BeValidEnum<TaskPriority>)`) — kod
tekrarını önlemek adına, Task CRUD'ta `ApplyStatus` gibi paylaşılan
yardımcı fonksiyonlar çıkardığımız mantığın aynısı.

## Adımlar

- [ ] **1. NuGet paketi kur**: `FluentValidation.AspNetCore`
      (`ProjectManager.Api` projesine, çünkü ASP.NET Core entegrasyonu
      oradan tetiklenecek; validator sınıfları `Application` katmanında
      tutulacak — kural DTO ile aynı yerde yaşasın diye)
- [ ] **2. İlk validator ile deseni doğrula**: `CreateTaskRequestValidator`
      (`Application/Validators/` altında) — tek DTO ile pipeline'ın uçtan
      uca çalıştığını görmek için
- [ ] **3. `Program.cs`'e DI kaydı** — `AddValidatorsFromAssemblyContaining<T>()`
      ile projedeki tüm validator'lar otomatik taranıp kaydedilir
      (`AddFluentValidationAutoValidation()` ile model binding'e bağlanır)
- [ ] **4. Kalan 6 validator'ı yaz** (yukarıdaki tablo)
- [ ] **5. Uçtan uca curl testi** — geçersiz veri gönderip 400 +
      `ProblemDetails` (validation hataları listesiyle) dönüğünü doğrula
- [ ] **6. Commit + push**

## Açık Karar

Enum doğrulama için ortak yardımcı fonksiyon mu yazılsın, yoksa her
validator kendi `Must(...)` kuralını mı tekrar etsin? İlk validator'ı
yazarken (adım 2) karar verip burayı güncelleyeceğiz.
