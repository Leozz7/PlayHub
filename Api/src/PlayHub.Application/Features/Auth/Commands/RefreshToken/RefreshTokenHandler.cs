using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Auth.Dtos;
using PlayHub.Application.Features.Users.Dtos;

namespace PlayHub.Application.Features.Auth.Commands.RefreshToken;

public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, AuthResponse?>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _tokenService;
    private readonly IEncryptionService _encryptionService;

    public RefreshTokenHandler(
        IApplicationDbContext context,
        IJwtTokenService tokenService,
        IEncryptionService encryptionService)
    {
        _context = context;
        _tokenService = tokenService;
        _encryptionService = encryptionService;
    }

    public async Task<AuthResponse?> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.RefreshToken == request.RefreshToken)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            return null;
        }

        var newAccessToken = _tokenService.GenerateToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var newExpiry = DateTime.UtcNow.AddDays(7);
        
        user.SetRefreshToken(newRefreshToken, newExpiry);
        
        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);

        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            RefreshTokenExpiry = newExpiry,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = _encryptionService.Decrypt(user.Email),
                Phone = user.Phone != null ? _encryptionService.Decrypt(user.Phone) : null,
                Cpf = user.Cpf != null ? _encryptionService.Decrypt(user.Cpf) : null,
                Role = user.Role
            }
        };
    }
}
