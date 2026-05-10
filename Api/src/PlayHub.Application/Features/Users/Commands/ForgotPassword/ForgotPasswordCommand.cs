using MediatR;

namespace PlayHub.Application.Features.Users.Commands.ForgotPassword;

public record ForgotPasswordCommand(string Email) : IRequest<bool>;
