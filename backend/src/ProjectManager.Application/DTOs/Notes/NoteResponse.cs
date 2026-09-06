namespace ProjectManager.Application.DTOs.Notes;

// Disariya donen not sekli - listeleme, olusturma ve guncelleme cevaplarinin
// hepsinde bu doner.
// Note entity'sindeki Project navigation property'si burada YOK: TaskResponse'taki
// ile ayni sebep - Project -> Notes -> her Note'un Project'i -> ... sonsuz donguyu
// onlemek icin duz bir int olarak ProjectId tasiyoruz.
// Type string: JSON'da enum'lar zaten string yaziliyor, service tarafinda
// .ToString() ile ceviriyoruz (TaskResponse ile ayni desen).
public record NoteResponse(
    int Id,
    int ProjectId,
    string Title,
    string Content,
    string Type,
    string[] Tags,
    DateTime CreatedAt,
    DateTime UpdatedAt);
