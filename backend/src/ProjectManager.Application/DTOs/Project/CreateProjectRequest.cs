namespace ProjectManager.Application.DTOs.Project;

// Yeni proje oluştururken frontend'den beklenen veri. Id/Slug/Status/CreatedAt
// burada yok - bunları backend üretir, kullanıcı göndermez.
public record CreateProjectRequest(string Name, string? Description, string[]? TechStack, string? RepositoryUrl);
