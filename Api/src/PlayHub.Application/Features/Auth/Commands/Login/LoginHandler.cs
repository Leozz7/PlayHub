using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Application.Features.Auth.Dtos;
using PlayHub.Application.Features.Users.Dtos;

namespace PlayHub.Application.Features.Auth.Commands.Login;

public class LoginHandler : IRequestHandler<LoginCommand, AuthResponse?>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _tokenService;
    private readonly PasswordHasher _passwordHasher;
    private readonly IEncryptionService _encryptionService;

    public LoginHandler(
        IApplicationDbContext context,
        IJwtTokenService tokenService,
        PasswordHasher passwordHasher,
        IEncryptionService encryptionService)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
        _encryptionService = encryptionService;
    }

    public async Task<AuthResponse?> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var emailIndex = _encryptionService.CreateBlindIndex(request.Email);
        
        var user = await _context.Users
            .Find(u => u.EmailIndex == emailIndex)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        var accessToken        = _tokenService.GenerateToken(user);
        var refreshToken       = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        user.SetRefreshToken(refreshToken, refreshTokenExpiry);
        
        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            RefreshTokenExpiry = refreshTokenExpiry,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = request.Email,
                Phone = user.Phone != null ? _encryptionService.Decrypt(user.Phone) : null,
                Cpf = user.Cpf != null ? _encryptionService.Decrypt(user.Cpf) : null,
                Role = user.Role
            }
        };
    }
}
