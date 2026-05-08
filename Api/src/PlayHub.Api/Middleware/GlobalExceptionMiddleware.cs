using PlayHub.Domain.Common;
using PlayHub.Domain.Common.Exceptions;
using System.Text.Json;

namespace PlayHub.Api.Middleware;

public class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await next(ctx);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(ctx, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext ctx, Exception ex)
    {
        var (status, title) = ex switch
        {
            ValidationException       => (400, "Erro de Validação"),
            NotFoundException         => (404, "Recurso não encontrado"),
            ForbiddenException        => (403, "Acesso negado"),
            ConflictException         => (409, "Conflito de dados"),
            InvalidOperationException => (400, "Operação inválida"),
            DomainException           => (422, "Violação de regra de negócio"),
            _                         => (500, "Erro interno do servidor")
        };

        if (status >= 500)
            logger.LogError(ex, "Erro não tratado [{TraceId}]: {Message}",
                ctx.TraceIdentifier, ex.Message);
        else
            logger.LogWarning(ex, "Erro de negócio {Status} [{TraceId}]: {Message}",
                status, ctx.TraceIdentifier, ex.Message);

        ctx.Response.ContentType = "application/problem+json";
        ctx.Response.StatusCode  = status;

        var errors = (ex as ValidationException)?.Errors;

        var problem = new
        {
            type    = "https://tools.ietf.org/html/rfc7807",
            title,
            status,
            detail  = ex.Message,
            errors,
            traceId = ctx.TraceIdentifier
        };

        await ctx.Response.WriteAsJsonAsync(problem,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
    }
}
