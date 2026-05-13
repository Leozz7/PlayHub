using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Auth.Commands.Login;
using PlayHub.Application.Features.Auth.Commands.RefreshToken;
using PlayHub.Application.Features.Auth.Commands.Logout;
using PlayHub.Application.Features.Users.Commands.RegisterUser;
using PlayHub.Application.Features.Users.Commands.ChangePassword;
using PlayHub.Application.Features.Users.Commands.ForgotPassword;
using PlayHub.Application.Features.Users.Commands.ResetPassword;
using PlayHub.Application.Features.Users.Queries.GetUserById;

namespace PlayHub.Api.Controllers;

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Name, string Email, string Password);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Email, string Token, string NewPassword);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IHostEnvironment _env;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IMediator mediator,
        IHostEnvironment env,
        ICurrentUserService currentUserService,
        ILogger<AuthController> logger)
    {
        _mediator = mediator;
        _env = env;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    private Guid LoggedInUserId => _currentUserService.UserId;

    private CookieOptions GetRefreshTokenCookieOptions(DateTime? expires = null)
    {
        var isDev = _env.EnvironmentName == "Development";
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDev,
            SameSite = isDev ? SameSiteMode.Lax : SameSiteMode.None,
            Expires = expires
        };
    }

    private CookieOptions GetAccessTokenCookieOptions(DateTime? expires = null)
    {
        var isDev = _env.EnvironmentName == "Development";
        return new CookieOptions
        {
            HttpOnly = true,
            Secure   = !isDev,
            SameSite = isDev ? SameSiteMode.Lax : SameSiteMode.Strict,
            Path     = "/",
            Expires  = expires
        };
    }

    [HttpPost("login")]
    [EnableRateLimiting("fixed")] 
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new LoginCommand(request.Email, request.Password), cancellationToken);

        if (result == null)
        {
            _logger.LogWarning("Tentativa de login falhou para o e-mail: {Email}", request.Email);
            return Unauthorized(new { message = "Usuário ou senha inválidos." });
        }

        Response.Cookies.Append("refreshToken", result.RefreshToken, GetRefreshTokenCookieOptions(result.RefreshTokenExpiry));
        Response.Cookies.Append("playhub_token", result.AccessToken, GetAccessTokenCookieOptions(DateTime.UtcNow.AddHours(2)));

        _logger.LogInformation("Usuário {UserId} realizou login com sucesso.", result.User.Id);

        return Ok(new { user = result.User });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken) || string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token não encontrado no cookie." });
        }

        var result = await _mediator.Send(new RefreshTokenCommand(refreshToken), cancellationToken);

        if (result == null)
        {
            return Unauthorized(new { message = "Refresh token inválido ou expirado." });
        }

        Response.Cookies.Append("refreshToken", result.RefreshToken, GetRefreshTokenCookieOptions(result.RefreshTokenExpiry));
        Response.Cookies.Append("playhub_token", result.AccessToken, GetAccessTokenCookieOptions(DateTime.UtcNow.AddHours(2)));

        return Ok(new { message = "Token atualizado com sucesso." });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await _mediator.Send(new LogoutCommand(LoggedInUserId), cancellationToken);
        
        _logger.LogInformation("Usuário {UserId} realizou logout.", LoggedInUserId);

        Response.Cookies.Delete("refreshToken",   GetRefreshTokenCookieOptions());
        Response.Cookies.Delete("playhub_token",   GetAccessTokenCookieOptions());
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile()
    {
        var userProfile = await _mediator.Send(new GetUserByIdQuery(LoggedInUserId));
        
        if (userProfile == null) 
            return NotFound(new { message = "Perfil do usuário não encontrado." });
            
        return Ok(userProfile);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("fixed")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new RegisterUserCommand(request.Name, request.Email, request.Password), cancellationToken);

        Response.Cookies.Append("refreshToken", result.RefreshToken, GetRefreshTokenCookieOptions(result.RefreshTokenExpiry));
        Response.Cookies.Append("playhub_token", result.AccessToken, GetAccessTokenCookieOptions(DateTime.UtcNow.AddHours(2)));

        _logger.LogInformation("Novo usuário registrado e logado: {UserId}", result.User.Id);

        return CreatedAtAction(nameof(GetMyProfile), new { user = result.User });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var command = new ChangePasswordCommand(LoggedInUserId, request.CurrentPassword, request.NewPassword);
        var result = await _mediator.Send(command, cancellationToken);

        if (!result) 
            return BadRequest(new { message = "A senha atual está incorreta ou não foi possível atualizar." });

        Response.Cookies.Delete("refreshToken",   GetRefreshTokenCookieOptions());
        Response.Cookies.Delete("playhub_token",   GetAccessTokenCookieOptions());
        return Ok(new { message = "Senha alterada com sucesso. Sessões anteriores foram invalidadas." });
    }
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var command = new ForgotPasswordCommand(request.Email);
        await _mediator.Send(command);
        return Ok(new { message = "Se o e-mail existir em nossa base, um link de recuperação será enviado." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var command = new ResetPasswordCommand(request.Email, request.Token, request.NewPassword);
        var result = await _mediator.Send(command);

        if (!result) return BadRequest(new { message = "Não foi possível redefinir a senha." });

        return Ok(new { message = "Senha redefinida com sucesso." });
    }
}