using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;

namespace PlayHub.Application.Features.Users.Commands.UpdateUser;

public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    private readonly IEncryptionService _encryptionService;

    public UpdateUserHandler(IApplicationDbContext context, PasswordHasher passwordHasher, IEncryptionService encryptionService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _encryptionService = encryptionService;
    }

    public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == request.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null) return false;

        var newEmailIndex = _encryptionService.CreateBlindIndex(request.Email);

        if (user.EmailIndex != newEmailIndex)
        {
            var exists = await _context.Users
                .Find(u => u.EmailIndex == newEmailIndex && u.Id != request.Id)
                .AnyAsync(cancellationToken);

            if (exists)
                throw new InvalidOperationException($"O e-mail '{request.Email}' já está em uso por outro usuário.");
        }

        var encryptedEmail = _encryptionService.Encrypt(request.Email);
        user.UpdateDetails(request.Name, encryptedEmail, newEmailIndex, request.Role);
        
        user.UpdatePhone(!string.IsNullOrWhiteSpace(request.Phone) ? _encryptionService.Encrypt(request.Phone) : null);
        user.UpdateCpf(!string.IsNullOrWhiteSpace(request.Cpf) ? _encryptionService.Encrypt(request.Cpf) : null);

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            var newHash = _passwordHasher.Hash(request.Password);
            user.SetNewPasswordHash(newHash);
        }

        if (request.CoutsId != null)
        {
            user.SetCourts(request.CoutsId);
        }

        var result = await _context.Users.ReplaceOneAsync(
            u => u.Id == request.Id,
            user,
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }
}