using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Application.Features.Users.Commands.UpdateMyProfile;

public record UpdateMyProfileCommand(Guid UserId, string Name, string Email, string? Phone, string? Cpf) : IRequest<bool>;
