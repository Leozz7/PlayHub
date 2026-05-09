using MediatR;
using Microsoft.Extensions.Logging;
using PlayHub.Application.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Common.Behaviours;

public class LoggingBehaviour<TRequest, TResponse>(
    ILogger<TRequest> logger,
    ICurrentUserService currentUserService)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = currentUserService.UserId;
        var userName = currentUserService.UserName ?? "Anonymous";

        if (requestName.EndsWith("Command"))
        {
            logger.LogInformation("PlayHub Command: {Name} {@UserId} {@UserName} {@Request}",
                requestName, userId, userName, request);
        }
        else
        {
            logger.LogDebug("PlayHub Query: {Name} {@UserId} {@UserName}",
                requestName, userId, userName);
        }

        return await next();
    }
}
