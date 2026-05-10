using Serilog.Context;

namespace PlayHub.Api.Middleware;

public class LogEnrichmentMiddleware
{
    private readonly RequestDelegate _next;

    public LogEnrichmentMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        
        using (LogContext.PushProperty("ClientIp", clientIp))
        {
            await _next(context);
        }
    }
}
