using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Enums;
using System.Collections.Generic;
using System.Linq;

namespace PlayHub.Application.Features.Courts.Queries.GetCourts;

public record GetCourtsQuery(
    CourtType? Type = null,
    CourtStatus? Status = null
) : IRequest<List<CourtDto>>;

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
