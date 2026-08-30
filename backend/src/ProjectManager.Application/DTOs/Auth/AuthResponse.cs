namespace ProjectManager.Application.DTOs.Auth;

// Kayıt/giriş sonrası dönen cevap. Token, register'da boş kalır (otomatik giriş yok);
// login'de dolu döner.
// "record": DTO'lar için tercih ettiğimiz tip - bkz. RegisterRequest.cs yorumu.
public record AuthResponse(int UserId, string Email, string DisplayName, string Token);

// Yukarıdaki record'un class ile YAZILMIŞ HALİ - sadece karşılaştırma/öğrenme
// amaçlı, gerçekte kullanılmıyor. Aynı şeyi yapmak için kaç satır gerektiğini
// görmek için burada duruyor.
//
// public class AuthResponseAsClass
// {
//     public int UserId { get; set; }
//     public string Email { get; set; }
//     public string DisplayName { get; set; }
//     public string Token { get; set; }
//
//     public AuthResponseAsClass(int userId, string email, string displayName, string token)
//     {
//         UserId = userId;
//         Email = email;
//         DisplayName = displayName;
//         Token = token;
//     }
// }
