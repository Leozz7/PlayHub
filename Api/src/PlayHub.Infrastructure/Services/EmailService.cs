using Microsoft.Extensions.Configuration;
using PlayHub.Application.Common.Interfaces;
using Resend;

namespace PlayHub.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly string _fromEmail;

    public EmailService(IResend resend, IConfiguration configuration)
    {
        _resend = resend;
        _fromEmail = configuration["Resend:From"] ?? "onboarding@resend.dev";
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var message = new EmailMessage
        {
            From = _fromEmail,
            To = to,
            Subject = subject,
            HtmlBody = body
        };

        await _resend.EmailSendAsync(message);
    }
}
