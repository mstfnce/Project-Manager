namespace ProjectManager.Application.DTOs.Tasks;

// Yeni görev oluştururken frontend'den beklenen veri.
// ProjectId burada yok -> URL'den geliyor (POST /api/projects/{projectId}/tasks).
// Status da yok -> yeni görev her zaman Todo ile başlar (kanban'ın ilk sütunu).
// Id/Order/CreatedAt/UpdatedAt/CompletedAt de yok -> hepsini backend üretir.
public record CreateTaskRequest(string Title, string? Description, string Priority, DateTime? DueDate);
