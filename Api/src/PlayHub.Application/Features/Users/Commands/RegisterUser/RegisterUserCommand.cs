using MediatR;
using PlayHub.Application.Features.Users.Dtos;

namespace PlayHub.Application.Features.Users.Commands.RegisterUser;

public record RegisterUserCommand(
    string Name,
    string Email,
    string Password
) : IRequest<UserDto>;
