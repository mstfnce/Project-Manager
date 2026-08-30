using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManager.Application.DTOs.Auth;
using ProjectManager.Application.Services;

namespace ProjectManager.Api.Controllers;

// HTTP isteğini karşılayan en dış katman. İş kuralını kendisi yapmaz,
// AuthService'e devreder - burada sadece HTTP <-> Application çevirisi var.
// Infrastructure'ı hiç görmez, sadece Application'daki AuthService'i tanır.
[ApiController]                // otomatik model doğrulama + otomatik 400 cevapları
[Route("api/auth")]            // bu controller'daki tüm endpoint'ler api/auth/... ile başlar
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    // Constructor injection: AuthService'i (ve onun IUserRepository/IPasswordHasher
    // bağımlılıklarını) DI container Program.cs'teki kayıtlara göre otomatik dolduruyor.
    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    // POST api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);   // 200 + AuthResponse JSON
        }
        catch (InvalidOperationException ex)
        {
            // "email zaten var" iş kuralı ihlali -> 409 Conflict
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);   // 200 + AuthResponse JSON
        }
        catch (UnauthorizedAccessException ex)
        {
            // "email veya şifre hatalı" -> 401 Unauthorized
            return Unauthorized(new { message = ex.Message });
        }
    }

    // [Authorize] test endpoint'i: geçerli token yoksa framework OTOMATİK 401 döner,
    // buradaki kod hiç çalışmaz. Token geçerliyse, içindeki claim'leri okuyoruz.
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);

        return Ok(new { userId, email });
    }
}
