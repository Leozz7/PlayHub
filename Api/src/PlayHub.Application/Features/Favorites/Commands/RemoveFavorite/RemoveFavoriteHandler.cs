using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Application.Features.Favorites.Commands.RemoveFavorite;

public class RemoveFavoriteHandler : IRequestHandler<RemoveFavoriteCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public RemoveFavoriteHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(RemoveFavoriteCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == request.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null) return false;

        var removed = user.RemoveFavorite(request.CourtId);

        if (!removed) return true;

        var result = await _context.Users.ReplaceOneAsync(
            u => u.Id == request.UserId,
            user,
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }
}
