using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Users.Commands.ForgotPassword;

public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IEncryptionService _encryptionService;
    private readonly IConfiguration _configuration;

    public ForgotPasswordHandler(IApplicationDbContext context, IEmailService emailService, IEncryptionService encryptionService, IConfiguration configuration)
    {
        _context = context;
        _emailService = emailService;
        _encryptionService = encryptionService;
        _configuration = configuration;
    }

    public async Task<bool> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var emailIndex = _encryptionService.CreateBlindIndex(request.Email);
        var user = await _context.Users
            .Find(u => u.EmailIndex == emailIndex)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
        {
            return true;
        }

        var token = Guid.NewGuid().ToString("N");
        var expiry = DateTime.UtcNow.AddHours(1);

        user.SetResetPasswordToken(token, expiry);

        await _context.Users.ReplaceOneAsync(
            u => u.Id == user.Id,
            user,
            cancellationToken: cancellationToken);

        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
        var userEmail = _encryptionService.Decrypt(user.Email);
        var resetLink = $"{frontendUrl}/reset-password?token={token}&email={userEmail}";
        
        var body = $@"
            <h1>Recuperação de Senha - PlayHub</h1>
            <p>Olá {user.Name},</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no link abaixo para criar uma nova senha:</p>
            <a href='{resetLink}'>Redefinir Senha</a>
            <p>Este link expira em 1 hora.</p>
            <p>Se você não solicitou isso, ignore este e-mail.</p>";

        await _emailService.SendEmailAsync(userEmail, "Recuperação de Senha - PlayHub", body);

        return true;
    }
}
