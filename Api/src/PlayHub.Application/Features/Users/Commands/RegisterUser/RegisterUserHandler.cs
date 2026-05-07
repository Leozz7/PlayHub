using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Application.Features.Users.Dtos;
using PlayHub.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Users.Commands.RegisterUser;

public class RegisterUserHandler : IRequestHandler<RegisterUserCommand, UserDto>
{
    private readonly IApplicationDbContext _db;
    private readonly PasswordHasher _hasher;
    private readonly IEncryptionService _encryptionService;

    public RegisterUserHandler(IApplicationDbContext db, PasswordHasher hasher, IEncryptionService encryptionService)
    {
        _db = db;
        _hasher = hasher;
        _encryptionService = encryptionService;
    }

    public async Task<UserDto> Handle(RegisterUserCommand request, CancellationToken ct)
    {
        var emailIndex = _encryptionService.CreateBlindIndex(request.Email);

        var exists = await _db.Users
            .Find(u => u.EmailIndex == emailIndex)
            .AnyAsync(ct);

        if (exists)
            throw new InvalidOperationException($"Email '{request.Email}' já está cadastrado.");

        var passwordHash = _hasher.Hash(request.Password);
        var encryptedEmail = _encryptionService.Encrypt(request.Email);

        // Forçamos a role 'User' internamente para evitar criação de Admins/Managers maliciosamente
        var user = new User(request.Name, encryptedEmail, emailIndex, passwordHash, "User");

        await _db.Users.InsertOneAsync(user, cancellationToken: ct);

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = request.Email,
            Role = user.Role,
            Created = user.Created
        };
    }
}
