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
}
