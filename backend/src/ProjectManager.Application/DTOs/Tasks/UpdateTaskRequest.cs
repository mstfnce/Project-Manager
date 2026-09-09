namespace ProjectManager.Application.DTOs.Tasks;

// Var olan bir görevi düzenleme formundan güncellerken beklenen veri (PUT /api/tasks/{id}).
// Create'ten farkı: Status da var - form açıkken kullanıcı görevi
// Todo/InProgress/Blocked/Done arası taşıyabilsin diye.
// PUT "hepsini gönder" demektir: eksik gönderilen alan null'lanır, o yüzden
// düzenlenebilir bütün alanlar burada tam olarak yer alıyor.
// Order yok -> aynı sütun içinde sıralama ayrı bir iş (tek kart değil, birden
// fazla kartın Order'ı birden değişir); ileride ayrı bir endpoint'e bırakıyoruz.
public record UpdateTaskRequest(
    string Title,
    string? Description,
    string Priority,
    string Status,
    DateTime? DueDate,
    int? ParentTaskId);
