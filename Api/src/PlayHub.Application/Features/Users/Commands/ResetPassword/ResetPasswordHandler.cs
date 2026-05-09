using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Users.Commands.ResetPassword;

public class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    private readonly IEncryptionService _encryptionService;

    public ResetPasswordHandler(IApplicationDbContext context, PasswordHasher passwordHasher, IEncryptionService encryptionService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _encryptionService = encryptionService;
    }

    public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var emailIndex = _encryptionService.CreateBlindIndex(request.Email);
        var user = await _context.Users
            .Find(u => u.EmailIndex == emailIndex)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            throw new Exception("Usuário não encontrado.");

        if (user.ResetPasswordToken != request.Token)
            throw new Exception("Token de recuperação inválido.");

        if (user.ResetPasswordTokenExpiry < DateTime.UtcNow)
            throw new Exception("Token de recuperação expirado.");

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            throw new Exception("A nova senha deve ter pelo menos 6 caracteres.");

        var newHash = _passwordHasher.Hash(request.NewPassword);
        user.SetNewPasswordHash(newHash);
        user.ClearResetPasswordToken();
        user.RevokeRefreshToken();

        var result = await _context.Users.ReplaceOneAsync(
            u => u.Id == user.Id,
            user,
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }
}
