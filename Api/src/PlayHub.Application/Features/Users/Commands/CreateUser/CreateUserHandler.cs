using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Application.Features.Users.Dtos;
using PlayHub.Domain.Entities;

namespace PlayHub.Application.Features.Users.Commands.CreateUser;

public class CreateUserHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IApplicationDbContext _db;
    private readonly PasswordHasher _hasher;
    private readonly IEncryptionService _encryptionService;

    public CreateUserHandler(IApplicationDbContext db, PasswordHasher hasher, IEncryptionService encryptionService)
    {
        _db = db;
        _hasher = hasher;
        _encryptionService = encryptionService;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var emailIndex = _encryptionService.CreateBlindIndex(request.Email);

        var exists = await _db.Users
            .Find(u => u.EmailIndex == emailIndex)
            .AnyAsync(ct);

        if (exists)
            throw new InvalidOperationException($"Email '{request.Email}' já está em uso.");

        var passwordHash = _hasher.Hash(request.Password);
        var encryptedEmail = _encryptionService.Encrypt(request.Email);

        var user = new User(request.Name, encryptedEmail, emailIndex, passwordHash, request.Role);

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