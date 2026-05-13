using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;

namespace PlayHub.Application.Features.Users.Commands.ChangePassword;

public class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly PasswordHasher _passwordHasher;

    public ChangePasswordHandler(IApplicationDbContext context, PasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<bool> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == request.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return false;

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            return false;

        var newHash = _passwordHasher.Hash(request.NewPassword);
        user.SetNewPasswordHash(newHash);
        user.RevokeRefreshToken();

        var result = await _context.Users.ReplaceOneAsync(
            u => u.Id == user.Id, 
            user, 
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }
}
