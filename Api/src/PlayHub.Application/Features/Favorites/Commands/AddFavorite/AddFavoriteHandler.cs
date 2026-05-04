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

        // Valida se a quadra existe
        var courtExists = await _context.Courts
            .Find(c => c.Id == request.CourtId)
            .AnyAsync(cancellationToken);

        if (!courtExists) return false;

        // O método de domínio garante idempotência
        var changed = user.AddFavorite(request.CourtId);

        if (!changed) return true; // Já era favorito — retorna sucesso sem re-salvar

        var result = await _context.Users.ReplaceOneAsync(
            u => u.Id == request.UserId,
            user,
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }
}
