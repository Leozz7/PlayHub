using MediatR;
using PlayHub.Application.Features.Users.Dtos;
using PlayHub.Application.Features.Courts.Queries.GetCourts;

namespace PlayHub.Application.Features.Users.Queries.GetUsers;

public record GetUsersQuery(string? Role = null, Guid? CourtId = null, string? Search = null, int PageNumber = 1, int PageSize = 50)
    : IRequest<PagedResult<UserDto>>;