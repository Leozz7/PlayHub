using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PlayHub.Application;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Api.Middleware;
using PlayHub.Infrastructure;
using PlayHub.Infrastructure.Persistence;
using Serilog;
using System.Globalization;
using System.Text;
using System.Threading.RateLimiting;
using PlayHub.Infrastructure.Hubs;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Serilog.Exceptions;
using System.Security.Claims;

var culture = new CultureInfo("pt-BR");
CultureInfo.DefaultThreadCurrentCulture = culture;
CultureInfo.DefaultThreadCurrentUICulture = culture;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();

// Serilog
builder.Host.UseSerilog((ctx, services, config) =>
    config
        .ReadFrom.Configuration(ctx.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .Enrich.WithExceptionDetails()
        .Enrich.WithProperty("Application", "PlayHub")
        .Enrich.WithProperty("Environment", ctx.HostingEnvironment.EnvironmentName)
        .Destructure.ByTransforming<PlayHub.Api.Controllers.LoginRequest>(r => new
        {
            Email       = "***",
            HasPassword = !string.IsNullOrEmpty(r.Password)
        })
        .Destructure.ByTransforming<PlayHub.Api.Controllers.RegisterRequest>(r => new
        {
            Name        = r.Name,
            Email       = "***",
            HasPassword = !string.IsNullOrEmpty(r.Password),
            Cpf         = "***",
            Phone       = "***"
        })
        .Destructure.ByTransforming<PlayHub.Application.Features.Users.Commands.RegisterUser.RegisterUserCommand>(r => new
        {
            Name        = r.Name,
            Email       = "***",
            HasPassword = !string.IsNullOrEmpty(r.Password)
        })
        .Destructure.ByTransforming<PlayHub.Application.Features.Users.Commands.ChangePassword.ChangePasswordCommand>(r => new
        {
            UserId      = r.UserId,
            HasCurrent  = !string.IsNullOrEmpty(r.CurrentPassword),
            HasNew      = !string.IsNullOrEmpty(r.NewPassword)
        }));

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "PlayHub API",
        Version     = "v1",
        Description = "Backend da plataforma PlayHub"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Insira o token JWT no formato: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("PlayHubPolicy", policy =>
    {
        policy
            .WithOrigins(
                "https://www.playhub.com",
                "https://playhub.com",
                "http://localhost:5173",
                "http://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// JWT
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey     = jwtSection["Key"]
    ?? throw new InvalidOperationException("Jwt:Key is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidIssuer              = jwtSection["Issuer"],
            ValidateAudience         = true,
            ValidAudience            = jwtSection["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime         = true,
            ClockSkew                = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// Rate Limiter
var rlConfig      = builder.Configuration.GetSection("RateLimiting");
var permitLimit   = rlConfig.GetValue<int>("PermitLimit", 100);
var windowMinutes = rlConfig.GetValue<int>("WindowInMinutes", 1);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.OnRejected = async (context, token) =>
    {
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            message    = "Limite de requisições excedido. Tente novamente mais tarde.",
            retryAfter = "1 minute"
        }, token);
    };

    options.AddPolicy("fixed", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "fallback",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window      = TimeSpan.FromMinutes(windowMinutes),
                QueueLimit  = rlConfig.GetValue<int>("QueueLimit", 0)
            }));
});

// Health Checks
var mongoConnectionString =
    builder.Configuration["MongoDB:ConnectionString"]
    ?? throw new InvalidOperationException("MongoDB:ConnectionString is not configured.");

builder.Services.AddHealthChecks()
    .AddMongoDb(
        mongodbConnectionString: mongoConnectionString,
        name: "mongodb",
        failureStatus: HealthStatus.Unhealthy,
        tags: ["db", "ready"])
    .AddDiskStorageHealthCheck(setup => 
        setup.AddDrive("/", minimumFreeMegabytes: 1024), 
        name: "disk", 
        tags: ["ready"])
    .AddCheck("self",
        () => HealthCheckResult.Healthy("API operacional."),
        tags: ["live"]);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PlayHub API v1");
        c.RoutePrefix = "swagger";
    });
}

// Request Logging (Serilog)
app.UseSerilogRequestLogging(opts =>
{
    opts.MessageTemplate =
        "HTTP {RequestMethod} {RequestPath} → {StatusCode} ({Elapsed:0.0}ms)";

    // Rotas de autenticação ficam em Debug
    opts.GetLevel = (httpCtx, _, _) =>
    {
        var path = httpCtx.Request.Path.Value ?? "";
        
        // Silencia logs
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
        diag.Set("RequestHost",   httpCtx.Request.Host.Value ?? "unknown");
        diag.Set("RequestScheme", httpCtx.Request.Scheme ?? "unknown");
        
        var userId = httpCtx.User.FindFirstValue(ClaimTypes.NameIdentifier) 
                  ?? httpCtx.User.FindFirstValue("sub");
        
        diag.Set("UserId", userId ?? "anonymous");
        diag.Set("UserName", httpCtx.User.FindFirstValue(ClaimTypes.Name) ?? "anonymous");
        diag.Set("ClientIp", httpCtx.Connection.RemoteIpAddress?.ToString() ?? "unknown");
    };
});

app.UseForwardedHeaders();
app.UseMiddleware<LogEnrichmentMiddleware>();
app.UseCors("PlayHubPolicy");
app.UseRateLimiter();

// Middleware Global de Exceções
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers().RequireRateLimiting("fixed");
app.MapHub<NotificationHub>("/hubs/playhub");

// Health Check Endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
    Predicate      = _ => true
}).AllowAnonymous();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate      = c => c.Tags.Contains("live"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
}).AllowAnonymous();

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate      = c => c.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
}).AllowAnonymous();

// Seed
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger   = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var dbContext         = services.GetRequiredService<MongoDbContext>();
        await dbContext.InitializeAsync();
        
        var hasher            = services.GetRequiredService<PasswordHasher>();
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

await app.RunAsync();