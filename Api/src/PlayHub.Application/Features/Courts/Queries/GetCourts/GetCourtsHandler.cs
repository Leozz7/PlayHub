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

        return courts.Select(court => new CourtDto
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
            Created = court.Created
        }).ToList();
    }
}
