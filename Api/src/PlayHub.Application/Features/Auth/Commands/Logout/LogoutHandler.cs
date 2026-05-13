using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Application.Features.Auth.Commands.Logout;

public class LogoutHandler : IRequestHandler<LogoutCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public LogoutHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == request.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
        {
            return false;
        }

        user.RevokeRefreshToken();
        await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);

        return true;
    }
}
