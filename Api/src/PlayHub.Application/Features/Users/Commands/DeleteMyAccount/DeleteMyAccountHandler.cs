using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;

namespace PlayHub.Application.Features.Users.Commands.DeleteMyAccount;

public class DeleteMyAccountHandler : IRequestHandler<DeleteMyAccountCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly PasswordHasher _passwordHasher;

    public DeleteMyAccountHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        PasswordHasher passwordHasher)
    {
        _context = context;
        _currentUserService = currentUserService;
        _passwordHasher = passwordHasher;
    }

    public async Task<bool> Handle(DeleteMyAccountCommand request, CancellationToken cancellationToken)
    {
        if (request.ConfirmText != "DELETE")
        {
            return false;
        }

        var userId = _currentUserService.UserId;
        if (userId == Guid.Empty)
        {
            return false;
        }

        var user = await _context.Users
            .Find(u => u.Id == userId)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
        {
            return false;
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return false;
        }

        // Deletar o usuário
        var result = await _context.Users.DeleteOneAsync(u => u.Id == userId, cancellationToken);

        return result.DeletedCount > 0;
    }
}
