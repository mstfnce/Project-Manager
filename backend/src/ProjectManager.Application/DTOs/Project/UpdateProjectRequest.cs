namespace ProjectManager.Application.DTOs.Project;

// Var olan bir projeyi güncellerken beklenen veri. Create'ten farkı: Status da
// değiştirilebilir (proje Active/Paused/Completed/Archived arası geçebilir).
public record UpdateProjectRequest(string Name, string? Description, string[]? TechStack, string? RepositoryUrl, string Status);
