using PlayHub.Application.Features.Users.Commands.RegisterUser;
using PlayHub.Application.Features.Users.Commands.ChangePassword;
using Serilog;
using Serilog.Exceptions;

namespace PlayHub.Api.Extensions;

public static class LoggingExtensions
{
    public static void AddCustomLogging(this IHostBuilder host)
    {
        host.UseSerilog((ctx, services, config) =>
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
                    Email = "***",
                    HasPassword = !string.IsNullOrEmpty(r.Password)
                })
                .Destructure.ByTransforming<PlayHub.Api.Controllers.RegisterRequest>(r => new
                {
                    Name = r.Name,
                    Email = "***",
                    HasPassword = !string.IsNullOrEmpty(r.Password),
                    Cpf = "***",
                    Phone = "***"
                })
                .Destructure.ByTransforming<RegisterUserCommand>(r => new
                {
                    Name = r.Name,
                    Email = "***",
                    HasPassword = !string.IsNullOrEmpty(r.Password)
                })
                .Destructure.ByTransforming<ChangePasswordCommand>(r => new
                {
                    UserId = r.UserId,
                    HasCurrent = !string.IsNullOrEmpty(r.CurrentPassword),
                    HasNew = !string.IsNullOrEmpty(r.NewPassword)
                }));
    }
}
