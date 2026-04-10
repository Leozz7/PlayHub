using PlayHub.Domain.Common;
using PlayHub.Domain.Enums;

namespace PlayHub.Domain.Entities;

public class SystemLog : BaseEntity
{
    public LogLevel Level { get; private set; }
    public string Message { get; private set; } = null!;
    public string? Exception { get; private set; }
    public string? Source { get; private set; }
    public Guid? UserId { get; private set; }

    private SystemLog() { }

    public SystemLog(LogLevel level, string message, string? exception = null, string? source = null, Guid? userId = null)
    {
        if (string.IsNullOrWhiteSpace(message))
            throw new DomainException("Message is required.");

        Level = level;
        Message = message;
        Exception = exception;
        Source = source;
        UserId = userId;
    }
}
