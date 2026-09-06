# Task CRUD — Request Akışı ve DTO/Return Type Notları

## HTTP isteği nasıl Service'e kadar iner?

**HTTP isteği → Controller → Service → Repository → DB**

- **HTTP isteği**: İstemci `PUT /api/tasks/5` + JSON body gönderir.
- **Controller** (Api katmanı): İsteği karşılar, JSON'ı ilgili DTO'ya (ör.
  `UpdateTaskRequest`) otomatik bind eder (ASP.NET Core model binding —
  JSON alan adları record property'leriyle case-insensitive eşleşir).
  Controller'ın kendisi HTTP'ye özgü işler dışında iş mantığı içermez;
  sadece "isteği al, servise devret, sonucu HTTP cevabına çevir" (200/404 vb).
- **Service** (Application katmanı): Asıl iş kuralları burada (ör. "proje var
  mı", "status Done'a geçince CompletedAt'i doldur"). HTTP'den tamamen
  habersiz, sadece C# nesneleriyle çalışır.
- **Repository** (Infrastructure katmanı): Service'in verdiği entity'yi
  gerçekten EF Core ile DB'ye yazar/okur.

Cevap da tam ters yönde geri döner: Repository → Service → Controller → HTTP
response. Dış katman içteki katmanı çağırır, asla tersi olmaz (Clean
Architecture'ın temel kuralı — bkz. [[interface-ve-composition-root]]).

`request` parametresinin kaynağı: Service metodunun imzasındaki
`(int id, UpdateTaskRequest request)` — bu değer Service'in içinde
üretilmiyor, çağrıldığı yerden (Controller) parametre olarak geliyor.
Controller da bu değeri kendisi üretmiyor, ASP.NET Core'un model binding'i
HTTP body'sindeki JSON'ı deserialize ederek dolduruyor.

## `async Task<IReadOnlyList<TaskResponse>?>` dönüş tipi

- **`Task<...>`** (dıştaki, `System.Threading.Tasks.Task`): asenkron işlemin
  ileride bir sonuç üreteceğinin sözü. `async` metodlar bu yüzden `void`
  değil `Task`/`Task<T>` döner — çağıran taraf `await` ile sonucu bekleyebilir.
- **`IReadOnlyList<TaskResponse>`**: `List<TaskResponse>` değil, salt-okunur
  liste arayüzü. Metodu çağıran taraf listeyi mutasyona uğratmasın diye
  bilerek daraltılmış dönüş tipi; içeride hâlâ gerçek bir `List<T>` var,
  sadece dışarıya verilen arayüz kısıtlı.
- **`?` (nullable)**: `null` = "proje yok" (Controller 404 üretir),
  boş liste `[]` = "proje var ama görevi yok" (Controller 200 üretir).
  Bu iki durum kasıtlı olarak ayrılıyor.

## `tasks.Select(ToResponse).ToList()` — entity → DTO dönüşümü

- `tasks`: DB'den gelen ham `TaskItem` entity listesi.
- `Select(ToResponse)`: LINQ'in "her elemanı dönüştür" metodu. `ToResponse`
  zaten `TaskItem` alıp `TaskResponse` döndüren bir metod olduğu için
  (`private static TaskResponse ToResponse(TaskItem task)`), `x =>
  ToResponse(x)` yazmaya gerek yok — method group olarak doğrudan verilebilir.
- `.ToList()`: LINQ `Select` lazy/deferred çalışır; `ToList()` onu hemen
  çalıştırıp sonucu somut bir listeye çevirir (materyalize eder).

Aynı desen `ProjectService` içinde `ProjectResponse` için de kullanılmıştı.

## `await _taskRepository.AddAsync(task);` — sadece kaydetmek mi?

Temel işi DB'ye kaydetmek, ama görünmeyen ikinci bir etkisi var:

```csharp
public async Task AddAsync(TaskItem task)
{
    _db.Tasks.Add(task);       // change tracker'a ekle (henüz DB'ye gitmedi)
    await _db.SaveChangesAsync();  // asıl INSERT burada gerçekleşir
}
```

`TaskItem.Id` identity kolonu olduğu için `new TaskItem { ... }` derken hiç
set edilmiyor (varsayılan `0`). `SaveChangesAsync()` çalışınca Postgres
gerçek Id'yi üretir ve EF Core, tracker'daki **aynı referans** olan `task`
nesnesinin `Id`'sini otomatik olarak bu gerçek değerle günceller.

Bu yüzden `AddAsync`'i `await` ettikten **sonra** çağrılan `ToResponse(task)`
satırında `task.Id` doğru, gerçek DB Id'sini taşır. `await` burada sadece
"asenkron bekleme" değil, aynı zamanda "gerçek Id gelene kadar bekle"
anlamına da geliyor.
