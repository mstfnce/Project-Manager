using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ProjectManager.Api.Middleware;

// [ApiController] zaten 400 (gecersiz model) ve bizim elle donduğumuz 404/204 gibi
// durumları otomatik ProblemDetails'e ceviriyor. Bu sınıf sadece BEKLENMEYEN
// (hic yakalanmamis) istisnaları yakalayip ayni formatta 500 dondurur.
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Islenmemis bir istisna yakalandi.");

        httpContext.Response.StatusCode = StatusCodes.Status500InternalServerError;

        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Beklenmeyen bir hata olustu.",
            Type = "https://tools.ietf.org/html/rfc9110#section-15.6.1"
        }, cancellationToken);

        return true;   // "bu istisnayi ben hallettim, ASP.NET Core baska bir sey yapmasin"
    }
}
