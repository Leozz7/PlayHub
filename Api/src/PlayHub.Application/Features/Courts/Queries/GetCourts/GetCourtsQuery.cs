using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Enums;
using System.Collections.Generic;
using System.Linq;

namespace PlayHub.Application.Features.Courts.Queries.GetCourts;

public record GetCourtsQuery(
    CourtType? Type = null,
    List<string>? Statuses = null,
    string? CurrentUserRole = null,
    Guid? CurrentUserId = null,
    List<Guid>? UserCourtIds = null,

    List<string>? Cities = null,
    string? Neighborhood = null,
    List<string>? Sports = null,
    int? Hour = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    DateTime? Date = null,
    string? Search = null,
    double? MinRating = null,
    int PageNumber = 1,
    int PageSize = 25
) : IRequest<PagedResult<CourtDto>>;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}

