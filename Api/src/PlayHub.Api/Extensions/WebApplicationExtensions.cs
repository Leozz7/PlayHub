using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using PlayHub.Api.Middleware;
using PlayHub.Infrastructure.Hubs;
using PlayHub.Infrastructure.Persistence;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Infrastructure.Persistence.Repositories;
using Serilog;
using System.Security.Claims;

namespace PlayHub.Api.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication UseApiPipeline(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "PlayHub API v1");
                c.RoutePrefix = "swagger";
            });
        }

        app.UseCustomRequestLogging();
        app.UseForwardedHeaders();
        app.UseMiddleware<LogEnrichmentMiddleware>();
        app.UseCors("PlayHubPolicy");
        app.UseAntiforgery();
        app.UseRateLimiter();
        app.UseCustomCsrf();
        app.UseMiddleware<GlobalExceptionMiddleware>();
        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers().RequireRateLimiting("fixed");
        app.MapHub<NotificationHub>("/hubs/playhub");
        app.MapCustomHealthChecks();

        return app;
    }

    private static IApplicationBuilder UseCustomRequestLogging(this IApplicationBuilder app)
    {
        app.UseSerilogRequestLogging(opts =>
        {
            opts.MessageTemplate = "HTTP {RequestMethod} {RequestPath} → {StatusCode} ({Elapsed:0.0}ms)";
            opts.GetLevel = (httpCtx, _, _) =>
            {
                var path = httpCtx.Request.Path.Value ?? "";
                if (path.Contains("hubs", StringComparison.OrdinalIgnoreCase) || 
                    path.Contains("negotiate", StringComparison.OrdinalIgnoreCase) ||
                    path.Contains("swagger", StringComparison.OrdinalIgnoreCase) ||
                    path.Contains("health", StringComparison.OrdinalIgnoreCase))
                {
                    return Serilog.Events.LogEventLevel.Debug;
                }
                return Serilog.Events.LogEventLevel.Information;
            };

            opts.EnrichDiagnosticContext = (diag, httpCtx) =>
            {
                diag.Set("RequestHost", httpCtx.Request.Host.Value ?? "unknown");
                diag.Set("RequestScheme", httpCtx.Request.Scheme ?? "unknown");
                var userId = httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? httpCtx.User.FindFirstValue("sub");
                diag.Set("UserId", userId ?? "anonymous");
                diag.Set("UserName", httpCtx.User.FindFirstValue(ClaimTypes.Name) ?? "anonymous");
                diag.Set("ClientIp", httpCtx.Connection.RemoteIpAddress?.ToString() ?? "unknown");
            };
        });
        return app;
    }

    private static IApplicationBuilder UseCustomCsrf(this IApplicationBuilder app)
    {
        app.Use(async (context, next) =>
        {
            if (HttpMethods.IsGet(context.Request.Method))
            {
                var antiforgery = context.RequestServices.GetRequiredService<Microsoft.AspNetCore.Antiforgery.IAntiforgery>();
                var tokens = antiforgery.GetAndStoreTokens(context);
                var isDev = context.RequestServices.GetRequiredService<IHostEnvironment>().IsDevelopment();
                
                context.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, 
                    new CookieOptions 
                    { 
                        HttpOnly = false, 
                        Secure = !isDev, 
                        SameSite = isDev ? SameSiteMode.Lax : SameSiteMode.Strict,
                        Path = "/"
                    });
            }
            await next();
        });
        return app;
    }

    private static void MapCustomHealthChecks(this IEndpointRouteBuilder endpoints)
    {
        var options = new HealthCheckOptions
        {
            ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
        };

        endpoints.MapHealthChecks("/health", new HealthCheckOptions { ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse, Predicate = _ => true }).AllowAnonymous();
        endpoints.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = c => c.Tags.Contains("live"), ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse }).AllowAnonymous();
        endpoints.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = c => c.Tags.Contains("ready"), ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse }).AllowAnonymous();
        endpoints.MapHealthChecks("/health/startup", new HealthCheckOptions { Predicate = c => c.Tags.Contains("startup"), ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse }).AllowAnonymous();
    }

    public static async Task SeedDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();

        try
        {
            var dbContext = services.GetRequiredService<MongoDbContext>();
            await dbContext.InitializeAsync();
            var hasher = services.GetRequiredService<PasswordHasher>();
            var encryptionService = services.GetRequiredService<IEncryptionService>();

            await ApplicationDbContextSeed.SeedAdminAsync(dbContext, hasher, encryptionService);
            await ApplicationDbContextSeed.SeedCourtsAsync(dbContext);
            logger.LogInformation("✅ Seed executado com sucesso.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "❌ Erro ao executar o seed do banco de dados.");
            throw;
        }
    }
}
