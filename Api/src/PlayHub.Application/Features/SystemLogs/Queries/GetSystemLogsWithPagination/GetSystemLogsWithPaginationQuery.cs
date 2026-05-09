using MediatR;
using PlayHub.Domain.Enums;

namespace PlayHub.Application.Features.SystemLogs.Queries.GetSystemLogsWithPagination;

public record GetSystemLogsWithPaginationQuery : IRequest<PagedResult<SystemLogDto>>
{
    public LogLevel? Level { get; init; }
    public string? Search { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 25;
}

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
