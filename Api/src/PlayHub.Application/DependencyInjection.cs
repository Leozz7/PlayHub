using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using PlayHub.Application.Common.Security;

namespace PlayHub.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));



        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddSingleton<PasswordHasher>();

        return services;
    }
}
