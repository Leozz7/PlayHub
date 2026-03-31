using MediatR;
using PlayHub.Application.Features.Users.Dtos;

namespace PlayHub.Application.Features.Users.Commands.CreateUser;

public record CreateUserCommand(
    string Name,
    string Email,
    string Password,
    string Role = "User"
) : IRequest<UserDto>;