using Microsoft.AspNetCore.Mvc;
using ProjectManager.Application.DTOs.Auth;
using ProjectManager.Application.Services;

namespace ProjectManager.Api.Controllers;

// HTTP isteğini karşılayan en dış katman. İş kuralını kendisi yapmaz,
// AuthService'e devreder - burada sadece HTTP <-> Application çevirisi var.
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

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
