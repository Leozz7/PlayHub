using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Application.Features.Users.Commands.DeleteUser;

public record DeleteUserCommand(Guid Id) : IRequest<bool>;
