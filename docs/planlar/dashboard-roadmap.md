# Dashboard Özeti — Ayrı Roadmap (Bölüm 5.5)

Task/Note CRUD'tan farklı: burada CRUD yok, tek bir **özet/aggregate**
endpoint var — `GET /api/dashboard/summary`. Orijinal plandaki tanım:
"proje sayıları, aktif görevler, yaklaşan deadline'lar".

## Tasarım Kararları

- **Response şekli** (öneri, onay bekliyor):
  ```csharp
  public record DashboardSummaryResponse(
      int TotalProjects,
      int ActiveProjects,          // Status == Active olanlar
      int ActiveTaskCount,         // Todo + InProgress + Blocked (Done hariç), tüm projeler toplamı
      IReadOnlyList<UpcomingTaskResponse> UpcomingDeadlines);

  public record UpcomingTaskResponse(
      int TaskId,
      string TaskTitle,
      int ProjectId,
      string ProjectName,
      DateTime DueDate);
  ```
  `UpcomingDeadlines`: `DueDate` dolu, `Status != Done`, tarihe göre artan
  sıralı, ilk 5 tanesi.

- **Eksik repository metodu**: `ITaskRepository`'de şu an sadece
  `GetAllByProjectAsync(projectId)` var — tek bir projenin görevlerini
  getiriyor. Dashboard **tüm projelerdeki** görevlere ihtiyaç duyuyor, bu
  yüzden `ITaskRepository`'ye yeni bir metot eklenmesi gerekiyor:
  `Task<IReadOnlyList<TaskItem>> GetAllAsync()` (bkz. `IProjectRepository`'de
  zaten var olan aynı isimli metot). Bu, var olan bir interface'e dokunmak
  anlamına geliyor — Task/Note CRUD'ta olmayan bir durum, dikkatli
  yapılmalı (mevcut `TaskRepository`'yi de güncellemek gerekecek).

- **Proje adı nereden gelecek**: `UpcomingTaskResponse.ProjectName` için
  `TaskItem.Project` navigation property'si (`.Include(t => t.Project)`)
  kullanılacak — Task/Note DTO'larında bilinçli olarak kaçındığımız
  navigation property kullanımı burada istisna, çünkü sonsuz döngü riski
  yok (tek yönlü, geri Project'e referans yok response'ta).

## Adımlar

- [ ] **1. `ITaskRepository`'ye `GetAllAsync()` ekle** (+ `TaskRepository`'de
      gerçekleştir, `.Include(t => t.Project)` ile)
- [ ] **2. DTO'lar** (`Application/DTOs/Dashboard/`)
  - [ ] `DashboardSummaryResponse`
  - [ ] `UpcomingTaskResponse`
- [ ] **3. `DashboardService`** (`Application/Services/`)
  - [ ] Yeni repository gerekmiyor — mevcut `IProjectRepository` +
        `ITaskRepository` yeterli
  - [ ] `GetSummaryAsync()`: proje sayıları + aktif görev sayısı + yaklaşan
        deadline listesi hesaplar (bellek içi LINQ ile — MVP ölçeğinde DB'ye
        ekstra sorgu yazmaya gerek yok)
- [ ] **4. `DashboardController`** (`Api/Controllers/`)
  - [ ] `GET /api/dashboard/summary` — tek endpoint, tek metot
- [ ] **5. `Program.cs` DI kaydı** — `DashboardService`
- [ ] **6. Uçtan uca curl testi**
- [ ] **7. Commit + push**

## Kararlar (çözüldü)

1. `UpcomingDeadlines` **ilk 5** kayıt döner.
2. "Yaklaşan" şimdilik **tüm gelecek deadline'lar** (tarih filtresi yok,
   sadece `DueDate >= bugün` + sıralama + ilk 5). İleride "önümüzdeki X gün"
   gibi bir pencereye daraltılabilir — bu not, o değişiklik gerektiğinde
   nerede yapılacağını hatırlatmak için tutuluyor.
