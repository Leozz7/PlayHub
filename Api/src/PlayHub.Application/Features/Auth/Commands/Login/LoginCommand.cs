using MediatR;
using PlayHub.Application.Features.Auth.Dtos;

namespace PlayHub.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponse?>;
