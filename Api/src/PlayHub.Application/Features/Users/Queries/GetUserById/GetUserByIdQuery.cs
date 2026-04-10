using MediatR;
using PlayHub.Application.Features.Users.Dtos;

namespace PlayHub.Application.Features.Users.Queries.GetUserById;

public record GetUserByIdQuery(Guid Id) : IRequest<UserDto?>;
