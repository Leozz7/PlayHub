using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Enums;
using System.Collections.Generic;
using System.Linq;

namespace PlayHub.Application.Features.Courts.Queries.GetCourts;

public class GetCourtsHandler : IRequestHandler<GetCourtsQuery, List<CourtDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCourtsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CourtDto>> Handle(GetCourtsQuery request, CancellationToken cancellationToken)
    {
        var filterBuilder = Builders<Domain.Entities.Court>.Filter;
        var filter = filterBuilder.Empty;

        if (request.Type.HasValue)
        {
            filter &= filterBuilder.Eq(c => c.Type, request.Type.Value);
        }

        if (request.Status.HasValue)
        {
            filter &= filterBuilder.Eq(c => c.Status, request.Status.Value);
        }

        if (!string.IsNullOrEmpty(request.City))
        {
            filter &= filterBuilder.Eq(c => c.City, request.City);
        }

        if (!string.IsNullOrEmpty(request.Neighborhood))
        {
            filter &= filterBuilder.Eq(c => c.Neighborhood, request.Neighborhood);
        }

        if (request.Sports != null && request.Sports.Any())
        {
            filter &= filterBuilder.AnyIn(c => c.Sports, request.Sports);
        }

        if (request.Hour.HasValue)
        {
            filter &= filterBuilder.Lte(c => c.OpeningHour, request.Hour.Value);
            filter &= filterBuilder.Gt(c => c.ClosingHour, request.Hour.Value);
        }

        if (request.MinPrice.HasValue)
        {
            filter &= filterBuilder.Gte(c => c.HourlyRate, request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            filter &= filterBuilder.Lte(c => c.HourlyRate, request.MaxPrice.Value);
        }

        if (request.CurrentUserRole == "Manager")
        {
            if (request.UserCourtIds == null || !request.UserCourtIds.Any())
            {
                return new List<CourtDto>();
            }
            filter &= filterBuilder.In(c => c.Id, request.UserCourtIds);
        }

        var courts = await _context.Courts
            .Find(filter)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow; // Ideally local time, but we'll use UTC for simplicity now
        var currentHour = now.Hour;

        return courts.Select(court => 
        {
            var isClosed = currentHour < court.OpeningHour || currentHour >= court.ClosingHour;
            var frontendStatus = isClosed ? "closed" : (court.Status == CourtStatus.Active ? "available" : "busy");

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

                // Rich Fields
                Address = court.Address,
                Neighborhood = court.Neighborhood,
                City = court.City,
                State = court.State,
                Location = string.IsNullOrWhiteSpace(court.City) ? "" : $"{court.City} • {court.Neighborhood}",
                
                OldPrice = court.OldPrice,
                Badge = court.Badge,
                Rating = court.Rating,
                ReviewCount = court.ReviewCount,
                Price = court.HourlyRate,
                
                OpeningHour = court.OpeningHour,
                ClosingHour = court.ClosingHour,
                
                Sport = court.Type.ToString(),
                Sports = court.Sports.ToList(),
                
                Img = court.ImageUrls.FirstOrDefault() ?? string.Empty,
                FrontendStatus = frontendStatus,
                AvailableToday = !isClosed
            };
        }).ToList();
    }
}
