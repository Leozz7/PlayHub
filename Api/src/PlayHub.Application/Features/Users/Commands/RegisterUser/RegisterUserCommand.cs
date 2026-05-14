using MediatR;
using PlayHub.Application.Features.Auth.Dtos;

namespace PlayHub.Application.Features.Users.Commands.RegisterUser;

public record RegisterUserCommand(
    string Name,
    string Email,
    string Password,
    string? Cpf = null
) : IRequest<AuthResponse>;
