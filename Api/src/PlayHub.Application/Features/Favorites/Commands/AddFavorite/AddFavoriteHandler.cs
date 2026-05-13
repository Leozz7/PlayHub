using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Application.Features.Favorites.Commands.AddFavorite;

public class AddFavoriteHandler : IRequestHandler<AddFavoriteCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public AddFavoriteHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(AddFavoriteCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == request.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null) return false;

        var courtExists = await _context.Courts
            .Find(c => c.Id == request.CourtId)
            .AnyAsync(cancellationToken);

        if (!courtExists) return false;

        var changed = user.AddFavorite(request.CourtId);

        if (!changed) return true;

        var result = await _context.Users.ReplaceOneAsync(
            u => u.Id == request.UserId,
            user,
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }
}
