using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Application.Features.Users.Commands.UpdateMyProfile;

public record UpdateMyProfileCommand(Guid UserId, string Name, string Email) : IRequest<bool>;

public class UpdateMyProfileHandler : IRequestHandler<UpdateMyProfileCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public UpdateMyProfileHandler(IApplicationDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<bool> Handle(UpdateMyProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == request.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null) return false;

        var newEmailIndex = _encryptionService.CreateBlindIndex(request.Email);

        if (user.EmailIndex != newEmailIndex)
        {
            var exists = await _context.Users
                .Find(u => u.EmailIndex == newEmailIndex && u.Id != request.UserId)
                .AnyAsync(cancellationToken);

            if (exists)
                throw new InvalidOperationException($"O e-mail '{request.Email}' já está em uso por outro usuário.");
        }

        var encryptedEmail = _encryptionService.Encrypt(request.Email);
        user.UpdateDetails(request.Name, encryptedEmail, newEmailIndex, user.Role);

        var result = await _context.Users.ReplaceOneAsync(
            u => u.Id == request.UserId,
            user,
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }
}