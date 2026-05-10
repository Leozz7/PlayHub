using PlayHub.Domain.Enums;

namespace PlayHub.Application.Features.SystemLogs.Queries.GetSystemLogsWithPagination;

public record SystemLogDto
{
    public Guid Id { get; init; }
    public LogLevel Level { get; init; }
    public string Message { get; init; } = null!;
    public string? Exception { get; init; }
    public string? Source { get; init; }
    public string? IpAddress { get; init; }
    public Guid? UserId { get; init; }
    public string? UserName { get; init; }
    public DateTime CreatedAt { get; init; }
}
