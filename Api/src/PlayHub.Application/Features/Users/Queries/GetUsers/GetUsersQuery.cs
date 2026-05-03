using MediatR;
using PlayHub.Application.Features.Users.Dtos;

namespace PlayHub.Application.Features.Users.Queries.GetUsers;

public record GetUsersQuery(string? Role = null, Guid? CourtId = null, string? Search = null, int Page = 1, int PageSize = 50)

    : IRequest<List<UserDto>>;