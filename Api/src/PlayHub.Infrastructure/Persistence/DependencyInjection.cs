using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Infrastructure.Identity;
using PlayHub.Infrastructure.Persistence;
using PlayHub.Infrastructure.Persistence.Repositories;
using PlayHub.Infrastructure.Services;
using Resend;


namespace PlayHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration config)
    {
        MongoDbBsonConfiguration.Configure();

        var connectionString = config["MongoDB:ConnectionString"]
            ?? throw new InvalidOperationException("MongoDB:ConnectionString is not configured.");

        var databaseName = config["MongoDB:DatabaseName"]
            ?? throw new InvalidOperationException("MongoDB:DatabaseName is not configured.");

        services.AddSingleton<IMongoClient>(new MongoClient(connectionString));

        services.AddSingleton<MongoDbContext>(provider =>
        {
            var client = provider.GetRequiredService<IMongoClient>();
            return new MongoDbContext(client, databaseName);
        });

        services.AddSingleton<IApplicationDbContext>(provider =>
            provider.GetRequiredService<MongoDbContext>());

        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IEncryptionService, Security.EncryptionService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ICourtRepository, CourtRepository>();
        
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        var resendApiKey = config["Resend:ApiKey"] ?? "re_xxxxxxxxx";
        services.AddHttpClient();
        services.AddSingleton<IResend>(ResendClient.Create(resendApiKey));
        services.AddScoped<IEmailService, EmailService>();

        return services;
    }
}