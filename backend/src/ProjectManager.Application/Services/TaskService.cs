using ProjectManager.Application.DTOs.Tasks;
using ProjectManager.Application.Interfaces;
using ProjectManager.Domain.Entities;
using ProjectManager.Domain.Enums;

namespace ProjectManager.Application.Services;

// Görev (Task) CRUD iş kurallarını barındıran servis.
// İki repository kullanıyor: kendi verisi için ITaskRepository, "bu proje
// gerçekten var mı" kontrolü için IProjectRepository. İkisi de Application'daki
// interface'ler - servis EF Core'u yine hiç tanımıyor.
public class TaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IProjectRepository _projectRepository;

    public TaskService(ITaskRepository taskRepository, IProjectRepository projectRepository)
    {
        _taskRepository = taskRepository;
        _projectRepository = projectRepository;
    }

    // Bir projenin görevlerini listeler.
    // Proje yoksa null döner (boş liste değil!): "proje yok" ile "projede görev
    // yok" farklı şeyler - Controller ilkini 404, ikincisini boş 200 yapacak.
    public async Task<IReadOnlyList<TaskResponse>?> GetAllByProjectAsync(int projectId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project is null) return null;

        var tasks = await _taskRepository.GetAllByProjectAsync(projectId);
        return tasks.Select(ToResponse).ToList();
    }

    // Id ile tek görev getirir. Bulunamazsa null (Controller 404'e çevirir).
    public async Task<TaskResponse?> GetByIdAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        return task is null ? null : ToResponse(task);
    }

    // Projeye yeni görev ekler. Proje yoksa null döner.
    public async Task<TaskResponse?> CreateAsync(int projectId, CreateTaskRequest request)
    {
        // Önce proje var mı? Kontrol etmezsek EF, olmayan bir ProjectId ile
        // INSERT dener ve foreign key ihlali 500 üretir - biz 404 istiyoruz.
        var project = await _projectRepository.GetByIdAsync(projectId);
        if (project is null) return null;

        // ParentTaskId gonderildiyse: o gorev gercekten var mi, AYNI projede mi,
        // ve kendisi de bir alt gorev DEGIL mi (sadece tek seviye ic ice gecis
        // destekleniyor - bir alt gorevin altina bir daha alt gorev eklenemez).
        if (request.ParentTaskId is not null)
        {
            var parent = await _taskRepository.GetByIdAsync(request.ParentTaskId.Value);
            if (parent is null || parent.ProjectId != projectId || parent.ParentTaskId is not null)
            {
                return null;
            }
        }

        var task = new TaskItem
        {
            ProjectId = projectId,
            Title = request.Title,
            Description = request.Description,
            Status = WorkItemStatus.Todo,   // yeni görev her zaman Todo sütununda doğar
            Priority = Enum.Parse<TaskPriority>(request.Priority),
            DueDate = ToUtc(request.DueDate),
            ParentTaskId = request.ParentTaskId,
            Order = await NextOrderAsync(projectId),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _taskRepository.AddAsync(task);

        return ToResponse(task);
    }

    // Görevin tüm düzenlenebilir alanlarını günceller (PUT - hepsini birden gönderir).
    public async Task<TaskResponse?> UpdateAsync(int id, UpdateTaskRequest request)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task is null) return null;

        // ParentTaskId gonderildiyse: kendi kendinin ustu olamaz, o gorev
        // gercekten var mi, AYNI projede mi, ve kendisi de bir alt gorev
        // DEGIL mi (CreateAsync'teki ile ayni uc kural).
        if (request.ParentTaskId is not null)
        {
            if (request.ParentTaskId == id) return null;

            var parent = await _taskRepository.GetByIdAsync(request.ParentTaskId.Value);
            if (parent is null || parent.ProjectId != task.ProjectId || parent.ParentTaskId is not null)
            {
                return null;
            }
        }

        task.Title = request.Title;
        task.Description = request.Description;
        task.Priority = Enum.Parse<TaskPriority>(request.Priority);
        task.DueDate = ToUtc(request.DueDate);
        task.ParentTaskId = request.ParentTaskId;
        ApplyStatus(task, Enum.Parse<WorkItemStatus>(request.Status));
        task.UpdatedAt = DateTime.UtcNow;

        await _taskRepository.UpdateAsync(task);

        return ToResponse(task);
    }

    // Sadece durumu değiştirir (PATCH) - kanban'da kart sürüklendiğinde.
    // Diğer alanlara hiç dokunmaz, o yüzden eski veriyle üzerine yazma riski yok.
    public async Task<TaskResponse?> UpdateStatusAsync(int id, UpdateTaskStatusRequest request)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task is null) return null;

        ApplyStatus(task, Enum.Parse<WorkItemStatus>(request.Status));
        task.UpdatedAt = DateTime.UtcNow;

        await _taskRepository.UpdateAsync(task);

        return ToResponse(task);
    }

    // Görevi siler. true = silindi, false = zaten yoktu (Controller 204/404 ayrımını buna göre yapar).
    public async Task<bool> DeleteAsync(int id)
    {
        var task = await _taskRepository.GetByIdAsync(id);
        if (task is null) return false;

        await _taskRepository.DeleteAsync(task);
        return true;
    }

    // --- Yardımcılar ---

    // Durumu değiştirirken CompletedAt'i de tutarlı tutar.
    // PUT (UpdateAsync) ve PATCH (UpdateStatusAsync) aynı kuralı uygulasın diye
    // tek yerde duruyor - kopyalasaydık biri değişince diğeri unutulabilirdi.
    private static void ApplyStatus(TaskItem task, WorkItemStatus newStatus)
    {
        if (newStatus == WorkItemStatus.Done && task.CompletedAt is null)
        {
            // Done'a yeni geçti: tamamlanma anını damgala.
            // "CompletedAt is null" kontrolü olmasaydı, zaten Done olan bir
            // görevin başlığını düzenlemek her seferinde tarihi bugüne kaydırırdı.
            task.CompletedAt = DateTime.UtcNow;
        }
        else if (newStatus != WorkItemStatus.Done)
        {
            // Done'dan geri çıktı (ör. tekrar açıldı): tamamlanma damgasını sil.
            task.CompletedAt = null;
        }

        task.Status = newStatus;
    }

    // JSON'dan gelen DueDate, saat dilimi bilgisi (Z/offset) icermiyorsa
    // Kind=Unspecified olarak deserialize edilir. Postgres'teki
    // "timestamp with time zone" sutunu ise sadece Kind=Utc kabul eder,
    // aksi halde Npgsql yazarken hata firlatir. Burada Kind'i acikca Utc
    // yapiyoruz - gercek bir saat donusumu degil, sadece etiketleme.
    private static DateTime? ToUtc(DateTime? dueDate) =>
        dueDate is null ? null : DateTime.SpecifyKind(dueDate.Value, DateTimeKind.Utc);

    // Yeni görev listenin sonuna eklensin diye bir sonraki Order değerini bulur.
    // Projede hiç görev yoksa 0, varsa en yüksek Order + 1.
    private async Task<int> NextOrderAsync(int projectId)
    {
        var tasks = await _taskRepository.GetAllByProjectAsync(projectId);
        return tasks.Count == 0 ? 0 : tasks.Max(t => t.Order) + 1;
    }

    // Entity'yi dışarıya dönecek DTO'ya çevirir. Project navigation property'si
    // taşınmıyor - sonsuz döngüyü önlemek için sadece ProjectId gidiyor.
    private static TaskResponse ToResponse(TaskItem task) =>
        new(
            task.Id, task.ProjectId, task.Title, task.Description,
            task.Status.ToString(), task.Priority.ToString(),
            task.DueDate, task.CompletedAt, task.Order,
            task.CreatedAt, task.UpdatedAt,
            task.ParentTaskId);
}
