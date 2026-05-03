using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Enums;
using System.Collections.Generic;
using System.Linq;

namespace PlayHub.Application.Features.Courts.Queries.GetCourts;

public class GetCourtsHandler : IRequestHandler<GetCourtsQuery, PagedResult<CourtDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCourtsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<CourtDto>> Handle(GetCourtsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow; // Ideally local time
        var currentHour = now.Hour;
        
        var filterBuilder = Builders<Domain.Entities.Court>.Filter;
        var filter = filterBuilder.Empty;

        if (request.Type.HasValue)
        {
            filter &= filterBuilder.Eq(c => c.Type, request.Type.Value);
        }

        if (request.Statuses != null && request.Statuses.Any())
        {
            var statusFilters = new List<FilterDefinition<Domain.Entities.Court>>();

            foreach (var status in request.Statuses)
            {
                if (status == "closed")
                {
                    statusFilters.Add(filterBuilder.Where(c => currentHour < c.OpeningHour || currentHour >= c.ClosingHour));
                }
                else if (status == "available")
                {
                    statusFilters.Add(filterBuilder.Where(c => currentHour >= c.OpeningHour && currentHour < c.ClosingHour && c.Status == CourtStatus.Active));
                }
                else if (status == "busy")
                {
                    statusFilters.Add(filterBuilder.Where(c => currentHour >= c.OpeningHour && currentHour < c.ClosingHour && c.Status != CourtStatus.Active));
                }
            }

            if (statusFilters.Any())
            {
                filter &= filterBuilder.Or(statusFilters);
            }
        }

        if (request.Cities != null && request.Cities.Any())
        {
            filter &= filterBuilder.In(c => c.City, request.Cities);
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

        if (!string.IsNullOrEmpty(request.Search))
        {
            var searchRegex = new MongoDB.Bson.BsonRegularExpression(request.Search, "i");
            filter &= (filterBuilder.Regex(c => c.Name, searchRegex) | filterBuilder.Regex(c => c.City, searchRegex) | filterBuilder.Regex(c => c.Neighborhood, searchRegex));
        }

        if (request.MinRating.HasValue)
        {
            filter &= filterBuilder.Gte(c => c.Rating, request.MinRating.Value);
        }

        if (request.CurrentUserRole == "Manager")
        {
            var courtIds = request.UserCourtIds ?? new List<Guid>();

            // If we have the User ID, fetch fresh court IDs from DB to ensure it's up to date
            if (request.CurrentUserId.HasValue)
            {
                var user = await _context.Users.Find(u => u.Id == request.CurrentUserId.Value).FirstOrDefaultAsync(cancellationToken);
                if (user != null)
                {
                    courtIds = user.CoutsId.ToList();
                }
            }

            if (!courtIds.Any())
            {
                return new PagedResult<CourtDto>
                {
                    Items = new List<CourtDto>(),
                    TotalCount = 0,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize
                };
            }
            filter &= filterBuilder.In(c => c.Id, courtIds);
        }


        var totalCount = (int)await _context.Courts.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var courts = await _context.Courts
            .Find(filter)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = courts.Select(court => 
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
                
                Img = court.MainImage != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(court.MainImage)}" : (court.ImageUrls.FirstOrDefault() ?? string.Empty),
                FrontendStatus = frontendStatus,
                AvailableToday = !isClosed,

                MainImageBase64 = court.MainImage != null ? Convert.ToBase64String(court.MainImage) : null,
                ImagesBase64 = court.Images.Select(Convert.ToBase64String).ToList(),
                Schedules = court.Schedules.Select(s => new OperatingDayDto
                {
                    Day = s.Day,
                    OpeningHour = s.OpeningHour,
                    ClosingHour = s.ClosingHour,
                    IsClosed = s.IsClosed
                }).ToList()

            };
        }).ToList();

        return new PagedResult<CourtDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

