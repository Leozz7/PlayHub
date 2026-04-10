using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;

namespace PlayHub.Application.Features.Users.Commands.ChangePassword;

public record ChangePasswordCommand(
    Guid UserId, 
    string CurrentPassword, 
    string NewPassword
) : IRequest<bool>;

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

        // 0. Validar requisitos da nova senha
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            throw new InvalidOperationException("A nova senha deve ter pelo menos 6 caracteres.");

        // 1. Verificar se a senha atual está correta
        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("A senha atual está incorreta.");

        // 2. Verificar se a nova senha é diferente da atual
        if (request.CurrentPassword == request.NewPassword)
            throw new InvalidOperationException("A nova senha não pode ser igual à senha atual.");

        // 3. Atualizar a senha e revogar o Refresh Token
        var newHash = _passwordHasher.Hash(request.NewPassword);
        user.SetNewPasswordHash(newHash);
        user.RevokeRefreshToken(); // Segurança: Invalida sessões em outros dispositivos

        var result = await _context.Users.ReplaceOneAsync(
            u => u.Id == user.Id, 
            user, 
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }
}
