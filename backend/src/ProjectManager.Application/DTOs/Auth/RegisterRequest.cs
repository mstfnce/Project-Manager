namespace ProjectManager.Application.DTOs.Auth;

// Kayıt isteği - frontend'den bu şekilde veri bekleniyor.
// "record": class'a benzer ama sadece veri taşımak için - kısa yazım,
// değiştirilemez (immutable), içerik bazlı otomatik karşılaştırma yapar.
// DTO'lar için class yerine bilerek record kullanıyoruz.
public record RegisterRequest(string Email, string Password, string DisplayName);
