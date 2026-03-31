using MediatR;

namespace PlayHub.Application.Features.Users.Commands.UpdateUser;

public record UpdateUserCommand(
    Guid Id,
    string Name,
    string Email,
    string Role,
    string? Password = null
) : IRequest<bool>;