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

        var courts = await _context.Courts
            .Find(c => user.FavoriteCourtIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

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
                Location = $"{c.City} • {c.Neighborhood}",
                Price = c.HourlyRate,
                Rating = c.Rating,
                ReviewCount = c.ReviewCount,
                OpeningHour = c.OpeningHour,
                ClosingHour = c.ClosingHour,
                Img = c.MainImage != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(c.MainImage)}" : (c.ImageUrls.Any() ? c.ImageUrls.First() : ""),
                MainImageBase64 = c.MainImage != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(c.MainImage)}" : null,
                FrontendStatus = c.Status == PlayHub.Domain.Enums.CourtStatus.Active ? "available" : (c.Status == PlayHub.Domain.Enums.CourtStatus.Maintenance ? "busy" : "closed"),
                AvailableToday = true 
            })
            .ToList();
    }
}
