using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using System.Linq;

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
            Created = court.Created
        };
    }
}
