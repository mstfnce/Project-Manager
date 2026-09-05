namespace ProjectManager.Application.DTOs.Tasks;

// Dışarıya dönen görev şekli - listeleme, oluşturma ve güncelleme cevaplarının
// hepsinde bu döner.
// TaskItem entity'sindeki Project navigation property'si burada YOK: koysaydık
// Project -> Tasks -> her Task'ın Project'i -> ... sonsuz döngü olur ve JSON
// serileştirme çökerdi. Onun yerine düz bir int olarak ProjectId taşıyoruz.
// Status/Priority string: JSON'da enum'lar zaten string yazılıyor, service
// tarafında .ToString() ile çeviriyoruz (ProjectResponse ile aynı desen).
public record TaskResponse(
    int Id,
    int ProjectId,
    string Title,
    string? Description,
    string Status,
    string Priority,
    DateTime? DueDate,
    DateTime? CompletedAt,
    int Order,
    DateTime CreatedAt,
    DateTime UpdatedAt);
