using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using System.Linq;
using PlayHub.Application.Common.Extensions;

namespace PlayHub.Application.Features.Courts.Queries.GetCourtById;

public class GetCourtByIdHandler : IRequestHandler<GetCourtByIdQuery, CourtDto?>
{
    private readonly IApplicationDbContext _context;

    public GetCourtByIdHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CourtDto?> Handle(GetCourtByIdQuery request, CancellationToken cancellationToken)
    {
        var court = await _context.Courts
            .Find(c => c.Id == request.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (court == null) return null;

        var now = DateTime.UtcNow;
        var currentHour = now.Hour;
        var isClosed = currentHour < court.OpeningHour || currentHour >= court.ClosingHour;
        var frontendStatus = isClosed ? "closed" : (court.Status == PlayHub.Domain.Enums.CourtStatus.Active ? "available" : "busy");

        return new CourtDto
        {
            Id = court.Id,
            Name = court.Name,
            Type = court.Type,
            HourlyRate = court.HourlyRate,
            Status = court.Status,
            Capacity = court.Capacity,
            Description = court.Description,
            Amenities = court.Amenities.ToList(),
            ImageUrls = court.ImageUrls.ToList(),
            Created = court.Created,

            Address = court.Address,
            Neighborhood = court.Neighborhood,
            City = court.City,
            State = court.State,
            Location = string.IsNullOrWhiteSpace(court.City) ? "" : $"{court.City} • {court.Neighborhood}",
            
            OldPrice = court.OldPrice,
            Badge = court.Badge,
            Rating = court.ReviewCount == 0 ? 5.0 : court.Rating,
            ReviewCount = court.ReviewCount,
            Price = court.HourlyRate,
            
            OpeningHour = court.OpeningHour,
            ClosingHour = court.ClosingHour,
            
            Sport = court.Type.ToFriendlyString(),
            Sports = court.Sports.ToList(),
            
            Img = court.MainImage != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(court.MainImage)}" : (court.ImageUrls.FirstOrDefault() ?? string.Empty),
            FrontendStatus = frontendStatus,
            AvailableToday = !isClosed,

            MainImageBase64 = court.MainImage != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(court.MainImage)}" : null,
            ImagesBase64 = court.Images.Select(img => $"data:image/jpeg;base64,{Convert.ToBase64String(img)}").ToList(),
            Schedules = court.Schedules.Select(s => new OperatingDayDto
            {
                Day = s.Day,
                OpeningHour = s.OpeningHour,
                ClosingHour = s.ClosingHour,
                IsClosed = s.IsClosed
            }).ToList()

        };
    }
}
