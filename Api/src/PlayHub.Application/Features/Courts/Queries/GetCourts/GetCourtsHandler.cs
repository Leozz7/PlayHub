using System;
using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
using PlayHub.Domain.Entities;
using PlayHub.Application.Common.Extensions;

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
        var requestDate = request.Date ?? DateTime.UtcNow.AddHours(-3);
        var dayOfWeek = requestDate.DayOfWeek;
        var currentHour = request.Hour ?? (DateTime.UtcNow.AddHours(-3).Hour);
        
        var filterBuilder = Builders<Domain.Entities.Court>.Filter;
        var scheduleFilterBuilder = Builders<OperatingDay>.Filter;
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
                    var openTodayFilter = scheduleFilterBuilder.And(
                        scheduleFilterBuilder.Eq("Day", dayOfWeek),
                        scheduleFilterBuilder.Eq("IsClosed", false)
                    );
                    
                    var noOpenSchedule = filterBuilder.Not(filterBuilder.ElemMatch<OperatingDay>("schedules", openTodayFilter));
                    var outsideHours = filterBuilder.Gt(c => c.OpeningHour, currentHour) | filterBuilder.Lte(c => c.ClosingHour, currentHour);
                    statusFilters.Add(noOpenSchedule | outsideHours);
                }
                else if (status == "available")
                {
                    var availableNowFilter = scheduleFilterBuilder.And(
                        scheduleFilterBuilder.Eq("Day", dayOfWeek),
                        scheduleFilterBuilder.Eq("IsClosed", false),
                        scheduleFilterBuilder.Lte("OpeningHour", currentHour),
                        scheduleFilterBuilder.Gt("ClosingHour", currentHour)
                    );

                    statusFilters.Add(
                        filterBuilder.Eq(c => c.Status, CourtStatus.Active) &
                        filterBuilder.ElemMatch<OperatingDay>("schedules", availableNowFilter)
                    );
                }
                else if (status == "busy")
                {
                    var openTodayFilter = scheduleFilterBuilder.And(
                        scheduleFilterBuilder.Eq("Day", dayOfWeek),
                        scheduleFilterBuilder.Eq("IsClosed", false)
                    );

                    statusFilters.Add(
                        filterBuilder.Ne(c => c.Status, CourtStatus.Active) &
                        filterBuilder.ElemMatch<OperatingDay>("schedules", openTodayFilter)
                    );
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
            filter &= filterBuilder.AnyIn("sports", request.Sports);
        }

        if (request.Hour.HasValue)
        {
            var hourFilter = scheduleFilterBuilder.And(
                scheduleFilterBuilder.Eq("Day", dayOfWeek),
                scheduleFilterBuilder.Eq("IsClosed", false),
                scheduleFilterBuilder.Lte("OpeningHour", request.Hour.Value),
                scheduleFilterBuilder.Gt("ClosingHour", request.Hour.Value)
            );
            filter &= filterBuilder.ElemMatch<OperatingDay>("schedules", hourFilter);
        }
        else if (request.Date.HasValue)
        {
            var dateFilter = scheduleFilterBuilder.And(
                scheduleFilterBuilder.Eq("Day", dayOfWeek),
                scheduleFilterBuilder.Eq("IsClosed", false)
            );
            filter &= filterBuilder.ElemMatch<OperatingDay>("schedules", dateFilter);
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

        // Se for Gestor, filtrar apenas pelas suas quadras
        if (string.Equals(request.CurrentUserRole, AppRoles.Manager, StringComparison.OrdinalIgnoreCase))
        {
            var courtIds = request.UserCourtIds ?? new List<Guid>();

            if (request.CurrentUserId.HasValue && request.CurrentUserId.Value != Guid.Empty)
            {
                var user = await _context.Users.Find(u => u.Id == request.CurrentUserId.Value).FirstOrDefaultAsync(cancellationToken);
                if (user != null && user.CoutsId != null)
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

        var findFluent = _context.Courts.Find(filter);

        if (!string.IsNullOrEmpty(request.SortBy))
        {
            var sortField = request.SortBy switch
            {
                "rating" => "Rating",
                "price" => "HourlyRate",
                "reviewCount" => "ReviewCount",
                _ => "Name"
            };

            var sort = request.IsDescending 
                ? Builders<Domain.Entities.Court>.Sort.Descending(sortField) 
                : Builders<Domain.Entities.Court>.Sort.Ascending(sortField);
            
            findFluent = findFluent.Sort(sort);
        }
        else
        {
            findFluent = findFluent.Sort(Builders<Domain.Entities.Court>.Sort.Descending(c => c.Rating));
        }

        var courts = await findFluent
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
                Amenities = (court.Amenities ?? Array.Empty<string>()).ToList(),
                ImageUrls = (court.ImageUrls ?? Array.Empty<string>()).ToList(),
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
                Sports = (court.Sports ?? Array.Empty<string>()).ToList(),
                
                Img = court.MainImage != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(court.MainImage)}" : ((court.ImageUrls ?? Array.Empty<string>()).FirstOrDefault() ?? string.Empty),
                FrontendStatus = frontendStatus,
                AvailableToday = !isClosed,

                MainImageBase64 = court.MainImage != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(court.MainImage)}" : null,
                ImagesBase64 = (court.Images ?? Enumerable.Empty<byte[]>()).Select(img => $"data:image/jpeg;base64,{Convert.ToBase64String(img)}").ToList(),
                Schedules = (court.Schedules ?? Enumerable.Empty<PlayHub.Domain.Entities.OperatingDay>()).Select(s => new OperatingDayDto
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

