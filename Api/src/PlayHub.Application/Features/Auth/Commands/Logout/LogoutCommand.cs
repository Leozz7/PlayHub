using MediatR;

namespace PlayHub.Application.Features.Auth.Commands.Logout;

public record LogoutCommand(Guid UserId) : IRequest<bool>;
