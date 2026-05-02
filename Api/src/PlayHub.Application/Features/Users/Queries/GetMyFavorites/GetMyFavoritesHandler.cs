using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;

namespace PlayHub.Application.Features.Users.Queries.GetMyFavorites;

public class GetMyFavoritesHandler : IRequestHandler<GetMyFavoritesQuery, List<CourtDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMyFavoritesHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CourtDto>> Handle(GetMyFavoritesQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == request.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null || user.FavoriteCourtIds.Count == 0)
            return new List<CourtDto>();

        // Busca todas as quadras favoritas em uma única query
        var courts = await _context.Courts
            .Find(c => user.FavoriteCourtIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        // Mantém a ordem original dos favoritos (mais recente primeiro)
        return user.FavoriteCourtIds
            .Select(id => courts.FirstOrDefault(c => c.Id == id))
            .Where(c => c is not null)
            .Select(c => new CourtDto
            {
                Id = c!.Id,
                Name = c.Name,
                Type = c.Type,
                HourlyRate = c.HourlyRate,
                Status = c.Status,
                Capacity = c.Capacity,
                Description = c.Description,
                Amenities = c.Amenities.ToList(),
                ImageUrls = c.ImageUrls.ToList(),
                Created = c.Created,
            })
            .ToList();
    }
}
