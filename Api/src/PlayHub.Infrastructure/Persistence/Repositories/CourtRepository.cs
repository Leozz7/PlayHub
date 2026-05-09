using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Queries.GetCourts;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using PlayHub.Domain.Constants;
using System.Collections.Generic;
using System.Linq;

namespace PlayHub.Infrastructure.Persistence.Repositories;

public class CourtRepository : ICourtRepository
{
    private readonly IApplicationDbContext _context;

    public CourtRepository(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(List<Court> Items, int TotalCount)> GetPagedCourtsAsync(GetCourtsQuery request, CancellationToken cancellationToken)
    {
        var requestDate = request.Date ?? DateTime.UtcNow.AddHours(-3);
        var dayOfWeek = requestDate.DayOfWeek;
        var currentHour = request.Hour ?? (DateTime.UtcNow.AddHours(-3).Hour);
        
        var filterBuilder = Builders<Court>.Filter;
        var scheduleFilterBuilder = Builders<OperatingDay>.Filter;
        var filter = filterBuilder.Empty;

        if (request.Type.HasValue)
        {
            filter &= filterBuilder.Eq(c => c.Type, request.Type.Value);
        }

        if (request.Statuses != null && request.Statuses.Any())
        {
            var statusFilters = new List<FilterDefinition<Court>>();

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
                return (new List<Court>(), 0);
            }
            filter &= filterBuilder.In(c => c.Id, courtIds);
        }

        var totalCount = (int)await _context.Courts.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var findFluent = _context.Courts.Find(filter);

        if (!string.IsNullOrEmpty(request.SortBy))
        {
            var sort = (request.SortBy.ToLower(), request.IsDescending) switch
            {
                ("rating", true) => Builders<Court>.Sort.Descending(c => c.Rating),
                ("rating", false) => Builders<Court>.Sort.Ascending(c => c.Rating),
                ("price", true) => Builders<Court>.Sort.Descending(c => c.HourlyRate),
                ("price", false) => Builders<Court>.Sort.Ascending(c => c.HourlyRate),
                ("reviewcount", true) => Builders<Court>.Sort.Descending(c => c.ReviewCount),
                ("reviewcount", false) => Builders<Court>.Sort.Ascending(c => c.ReviewCount),
                (_, true) => Builders<Court>.Sort.Descending(c => c.Name),
                (_, false) => Builders<Court>.Sort.Ascending(c => c.Name)
            };
            
            findFluent = findFluent.Sort(sort);
        }
        else
        {
            findFluent = findFluent.Sort(Builders<Court>.Sort.Descending(c => c.Rating));
        }

        var items = await findFluent
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Court?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Courts.Find(c => c.Id == id).FirstOrDefaultAsync(cancellationToken);
    }
}
