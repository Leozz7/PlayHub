using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using MongoDB.Driver;
using MediatR;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Application.Features.Users.Queries.GetUserById;
using PlayHub.Domain.Entities;
using PlayHub.Application.Features.Users.Commands.ChangePassword;

namespace PlayHub.Api.Controllers;

public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Name, string Email, string Password);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _tokenService;
    private readonly PasswordHasher _passwordHasher;
    private readonly IMediator _mediator;
    private readonly IEncryptionService _encryptionService;
    private readonly IHostEnvironment _env;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(
        IApplicationDbContext context,
        IJwtTokenService tokenService,
        PasswordHasher passwordHasher,
        IMediator mediator,
        IEncryptionService encryptionService,
        IHostEnvironment env,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _mediator = mediator;
        _encryptionService = encryptionService;
        _env = env;
        _currentUserService = currentUserService;
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

    [HttpPost("login")]
    [EnableRateLimiting("fixed")] 
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var emailIndex = _encryptionService.CreateBlindIndex(request.Email);
        
        var user = await _context.Users
            .Find(u => u.EmailIndex == emailIndex)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Usuário ou senha inválidos." });
        }

        var accessToken = _tokenService.GenerateToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        user.SetRefreshToken(refreshToken, refreshTokenExpiry);
        
        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);

        Response.Cookies.Append("refreshToken", refreshToken, GetRefreshTokenCookieOptions(refreshTokenExpiry));

        return Ok(new
        {
            accessToken,
            user = new { 
                user.Id, 
                user.Name, 
                Email = request.Email,
                Phone = user.Phone != null ? _encryptionService.Decrypt(user.Phone) : null,
                Cpf = user.Cpf != null ? _encryptionService.Decrypt(user.Cpf) : null,
                user.Role 
            }
        });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken) || string.IsNullOrWhiteSpace(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token não encontrado no cookie." });
        }

        var user = await _context.Users
            .Find(u => u.RefreshToken == refreshToken)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return Unauthorized(new { message = "Refresh token inválido ou expirado." });
        }

        var newAccessToken = _tokenService.GenerateToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var newExpiry = DateTime.UtcNow.AddDays(7);
        
        user.SetRefreshToken(newRefreshToken, newExpiry);
        
        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);

        Response.Cookies.Append("refreshToken", newRefreshToken, GetRefreshTokenCookieOptions(newExpiry));

        return Ok(new { accessToken = newAccessToken });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == LoggedInUserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (user != null)
        {
            user.RevokeRefreshToken();
            await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);
        }

        Response.Cookies.Delete("refreshToken", GetRefreshTokenCookieOptions());
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
        try
        {
            var command = new PlayHub.Application.Features.Users.Commands.RegisterUser.RegisterUserCommand(request.Name, request.Email, request.Password);
            var resultDto = await _mediator.Send(command, cancellationToken);

            var user = await _context.Users
                .Find(u => u.Id == resultDto.Id)
                .FirstOrDefaultAsync(cancellationToken);

            var accessToken = _tokenService.GenerateToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            user.SetRefreshToken(refreshToken, refreshTokenExpiry);
            
            await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);

            Response.Cookies.Append("refreshToken", refreshToken, GetRefreshTokenCookieOptions(refreshTokenExpiry));

            return CreatedAtAction(nameof(GetMyProfile), new
            {
                accessToken,
                user = new { 
                    resultDto.Id, 
                    resultDto.Name, 
                    resultDto.Email,
                    resultDto.Role 
                }
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var command = new ChangePasswordCommand(LoggedInUserId, request.CurrentPassword, request.NewPassword);
            var result = await _mediator.Send(command, cancellationToken);
            
            if (!result) return NotFound();

            Response.Cookies.Delete("refreshToken", GetRefreshTokenCookieOptions());
            return Ok(new { message = "Senha alterada com sucesso. Sessões anteriores foram invalidadas." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}