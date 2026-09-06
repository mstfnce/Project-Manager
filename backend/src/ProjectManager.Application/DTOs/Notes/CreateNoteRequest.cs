namespace ProjectManager.Application.DTOs.Notes;

// Yeni not olustururken frontend'den beklenen veri.
// ProjectId burada yok -> URL'den geliyor (POST /api/projects/{projectId}/notes).
// Id/CreatedAt/UpdatedAt de yok -> hepsini backend uretir.
public record CreateNoteRequest(string Title, string Content, string Type, string[] Tags);
