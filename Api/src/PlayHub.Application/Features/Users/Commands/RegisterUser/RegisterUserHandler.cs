using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Application.Features.Users.Dtos;
using PlayHub.Domain.Common.Exceptions;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Common;
using PlayHub.Application.Common.Extensions;
using PlayHub.Application.Features.Auth.Dtos;

namespace PlayHub.Application.Features.Users.Commands.RegisterUser;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, AuthResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly PasswordHasher _hasher;
    private readonly IEncryptionService _encryptionService;
    private readonly IJwtTokenService _tokenService;

    public RegisterUserHandler(
        IApplicationDbContext db, 
        PasswordHasher hasher, 
        IEncryptionService encryptionService,
        IJwtTokenService tokenService)
    {
        _db = db;
        _hasher = hasher;
        _encryptionService = encryptionService;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> Handle(RegisterUserCommand request, CancellationToken ct)
    {
        var emailIndex = _encryptionService.CreateBlindIndex(request.Email);

        var exists = await _db.Users
            .Find(u => u.EmailIndex == emailIndex)
            .AnyAsync(ct);

        if (exists)
            throw new ConflictException($"E-mail já está cadastrado.");

        var passwordHash = _hasher.Hash(request.Password);
        var encryptedEmail = _encryptionService.Encrypt(request.Email);

        var user = new User(request.Name, encryptedEmail, emailIndex, passwordHash, "User");

        if (!string.IsNullOrWhiteSpace(request.Cpf))
        {
            if (!request.Cpf.IsValidCpf())
                throw new DomainException("CPF inválido.");

            user.UpdateCpf(_encryptionService.Encrypt(request.Cpf));
        }

        await _db.Users.InsertOneAsync(user, cancellationToken: ct);

        var accessToken        = _tokenService.GenerateToken(user);
        var refreshToken       = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        
        user.SetRefreshToken(refreshToken, refreshTokenExpiry);
        
        await _db.Users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: ct);

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
                Cpf = request.Cpf,
                Role = user.Role,
                Created = user.Created
            }
        };
    }
}
