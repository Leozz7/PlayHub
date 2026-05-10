using MediatR;

namespace PlayHub.Application.Features.Users.Commands.ResetPassword;

public record ResetPasswordCommand(string Email, string Token, string NewPassword) : IRequest<bool>;
