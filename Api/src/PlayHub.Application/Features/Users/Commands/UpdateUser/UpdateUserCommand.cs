using MediatR;

namespace PlayHub.Application.Features.Users.Commands.UpdateUser;

public record UpdateUserCommand(
    Guid Id,
    string Name,
    string Email,
    string Role,
    string? Phone = null,
    string? Cpf = null,
    List<Guid>? CoutsId = null,
    string? Password = null
) : IRequest<bool>;