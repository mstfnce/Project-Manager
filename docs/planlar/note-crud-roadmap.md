# Note CRUD — Ayrı Roadmap (Bölüm 5.4)

Ana `ROADMAP.md`'ye dokunmadan, Task CRUD ile aynı adım sırasını izleyen
ayrı bir çalışma listesi. Task CRUD'ta izlenen sıra: DTO → repository
interface → repository → service → controller → DI kaydı → test → commit.

## Veri Modeli (mevcut, `Note` entity zaten var)

| Alan | Tip |
|---|---|
| Id | int |
| ProjectId | int (FK) |
| Title | string |
| Content | string (markdown) |
| Type | enum: Decision / Learning / Idea / Meeting / General |
| Tags | string[] |
| CreatedAt / UpdatedAt | DateTime |

## Adımlar

- [ ] **1. DTO'lar** (`Application/DTOs/Notes/`)
  - [ ] `CreateNoteRequest` (Title, Content, Type, Tags) — ProjectId URL'den gelir
  - [ ] `UpdateNoteRequest` (Title, Content, Type, Tags) — PUT, hepsini birden günceller
  - [ ] `NoteResponse` (Id, ProjectId, Title, Content, Type, Tags, CreatedAt, UpdatedAt)
- [ ] **2. `INoteRepository`** (`Application/Interfaces/`)
  - [ ] `GetAllByProjectAsync(int projectId)`
  - [ ] `GetByIdAsync(int id)`
  - [ ] `AddAsync(Note note)`
  - [ ] `UpdateAsync(Note note)`
  - [ ] `DeleteAsync(Note note)`
- [ ] **3. `NoteRepository`** (`Infrastructure/Repositories/`) — `AppDbContext` ile gerçekleştirme
- [ ] **4. `NoteService`** (`Application/Services/`)
  - [ ] `ITaskRepository`/`IProjectRepository` desenindeki gibi: proje var mı kontrolü için `IProjectRepository` de inject edilecek
  - [ ] `GetAllByProjectAsync` — proje yoksa null (404), varsa liste (boş da olabilir)
  - [ ] `GetByIdAsync`
  - [ ] `CreateAsync(projectId, request)` — proje yoksa null
  - [ ] `UpdateAsync(id, request)`
  - [ ] `DeleteAsync(id)` — bool
- [ ] **5. `NotesController`** (`Api/Controllers/`) — Task ile aynı "tek controller, tam route" deseni
  - [ ] `GET /api/projects/{projectId}/notes`
  - [ ] `POST /api/projects/{projectId}/notes`
  - [ ] `GET /api/notes/{id}`
  - [ ] `PUT /api/notes/{id}`
  - [ ] `DELETE /api/notes/{id}`
- [ ] **6. `Program.cs` DI kaydı** — `INoteRepository`/`NoteService`
- [ ] **7. Uçtan uca curl testi** — create/get/update/delete + 404 senaryoları (Task CRUD'takiyle aynı yöntem)
- [ ] **8. Commit + push**

## Karar (çözüldü)

Orijinal plandaki endpoint tablosunda `GET /api/notes/{id}` yoktu, ama
düzenleme formu tekil not verisine ihtiyaç duyacağı için (Task'taki
`GetById` ile aynı gerekçe) eklenmesine karar verildi — madde 5'e işlendi.
