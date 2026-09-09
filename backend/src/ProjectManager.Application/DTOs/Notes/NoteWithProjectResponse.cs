
namespace ProjectManager.Application.DTOs.Notes;
// Global notlar sayfasi (GET /api/notes) icin - NoteResponse'un uzerine
// ProjectName ekliyor, cunku o listede her satirda "hangi projeye ait"
// rozeti gosteriliyor.
//
// Neden NoteResponse'a ProjectName eklemedik: proje-ici endpoint'te
// (GET /api/projects/{id}/notes) hangi projede oldugumuz zaten belli,
// oraya da gereksiz yere tasinmasin diye. Dashboard'daki
// UpcomingTaskResponse de tam bu sebeple ayri bir DTO.
public record NoteWithProjectResponse(
    int Id,
    int ProjectId,
    string ProjectName,
    string Title,
    string Content,
    string Type,
    string[] Tags,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
