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

    public CreateUserHandler(IApplicationDbContext db, PasswordHasher hasher)
    {
        _db = db;
        _hasher = hasher;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken ct)
    {
        // Verifica se email já existe
        var exists = await _db.Users
            .Find(u => u.Email == request.Email.ToLowerInvariant())
            .AnyAsync(ct);

        if (exists)
            throw new InvalidOperationException($"Email '{request.Email}' já está em uso.");

        var hash = _hasher.Hash(request.Password);
        var user = new User(request.Name, request.Email, hash, request.Role);

        await _db.Users.InsertOneAsync(user, cancellationToken: ct);

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Created = user.Created
        };
    }
}