using ProjectManager.Application.DTOs.Auth;
using ProjectManager.Application.Interfaces;
using ProjectManager.Domain.Entities;

namespace ProjectManager.Application.Services;

// Kayıt/giriş iş kurallarını barındıran servis. Veritabanını ve BCrypt'i
// doğrudan tanımaz - sadece IUserRepository/IPasswordHasher arayüzlerini
// kullanır, gerçek işi kimin yaptığını bilmez (Infrastructure yapıyor).
public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    // Constructor injection: DI container bu iki arayüzü otomatik doldurur.
    public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // İş kuralı: aynı email ile iki kayıt olamaz.
        if (await _userRepository.ExistsByEmailAsync(request.Email))
            throw new InvalidOperationException("Bu email zaten kullanılıyor.");

        var user = new User
        {
            Email = request.Email,
            PasswordHash = _passwordHasher.Hash(request.Password),   // ham şifre asla saklanmaz
            DisplayName = request.DisplayName,
            CreatedAt = DateTime.UtcNow   // UTC: sunucu saat dilimi farkı sorun yaratmasın
        };

        await _userRepository.AddAsync(user);

        // Token boş: register otomatik giriş yapmaz, ayrı bir login gerekir (Bölüm 4.4).
        return new AuthResponse(user.Id, user.Email, user.DisplayName, Token: "");
    }
}
