namespace ProjectManager.Application.DTOs.Auth;

// Kayıt/giriş sonrası dönen cevap. Token, register'da boş kalır (otomatik giriş yok);
// login'de dolu döner.
// "record": DTO'lar için tercih ettiğimiz tip - bkz. RegisterRequest.cs yorumu.
public record AuthResponse(int UserId, string Email, string DisplayName, string Token);
