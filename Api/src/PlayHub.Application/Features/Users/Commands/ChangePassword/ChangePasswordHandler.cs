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

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            throw new InvalidOperationException("A nova senha deve ter pelo menos 6 caracteres.");

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("A senha atual está incorreta.");

        if (request.CurrentPassword == request.NewPassword)
            throw new InvalidOperationException("A nova senha não pode ser igual à senha atual.");

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
