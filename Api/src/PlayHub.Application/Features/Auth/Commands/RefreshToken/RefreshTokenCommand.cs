using MediatR;
using PlayHub.Application.Features.Auth.Dtos;

namespace PlayHub.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResponse?>;
