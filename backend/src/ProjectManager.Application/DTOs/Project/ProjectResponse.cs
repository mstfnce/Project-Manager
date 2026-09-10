namespace ProjectManager.Application.DTOs.Project;

// Dışarıya dönen proje şekli. Task/Note/RoadmapItem koleksiyonlarını olduğu
// gibi değil, sadece sayı olarak taşıyoruz (circular reference + fazla veri sızıntısını önler).
public record ProjectResponse(
    int Id,
    string Name,
    string Slug,
    string? Description,
    string Status,
    string[] TechStack,
    string? RepositoryUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int TaskCount,
    // Tamamlanan görev sayısı. Yüzdeyi backend hesaplayıp göndermiyoruz,
    // iki sayıyı gönderip oranı frontend kuruyor - böylece kartta "3/8"
    // gibi başka bir gösterim istersek backend'e dokunmamız gerekmiyor.
    int CompletedTaskCount,
    int NoteCount);
