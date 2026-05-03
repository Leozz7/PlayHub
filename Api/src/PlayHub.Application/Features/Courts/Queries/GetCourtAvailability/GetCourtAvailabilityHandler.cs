using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Courts.Queries.GetCourtAvailability;

public class GetCourtAvailabilityHandler : IRequestHandler<GetCourtAvailabilityQuery, CourtAvailabilityDto>
{
    private readonly IApplicationDbContext _context;

    public GetCourtAvailabilityHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CourtAvailabilityDto> Handle(GetCourtAvailabilityQuery request, CancellationToken cancellationToken)
    {
        var court = await _context.Courts
            .Find(c => c.Id == request.CourtId)
            .FirstOrDefaultAsync(cancellationToken);

        if (court == null)
        {
            throw new Exception("Court not found"); // Ideally a custom exception
        }

        var startOfDay = request.Date.Date;
        var endOfDay = startOfDay.AddDays(1);

        var filterBuilder = Builders<Reservation>.Filter;
        var filter = filterBuilder.Eq(r => r.CourtId, request.CourtId) &
                     filterBuilder.Gte(r => r.StartTime, startOfDay) &
                     filterBuilder.Lt(r => r.StartTime, endOfDay) &
                     filterBuilder.Ne(r => r.Status, PlayHub.Domain.Enums.ReservationStatus.Cancelled);

        var reservations = await _context.Reservations
            .Find(filter)
            .ToListAsync(cancellationToken);

        var busySlots = new HashSet<int>();
        foreach (var reservation in reservations)
        {
            for (int hour = reservation.StartTime.Hour; hour < reservation.EndTime.Hour; hour++)
            {
                busySlots.Add(hour);
            }
        }

        var totalPossibleSlots = court.ClosingHour - court.OpeningHour;
        var isAvailable = busySlots.Count < totalPossibleSlots;

        return new CourtAvailabilityDto
        {
            OpeningHour = court.OpeningHour,
            ClosingHour = court.ClosingHour,
            BusySlots = busySlots.OrderBy(h => h).ToList(),
            Available = isAvailable
        };
    }
}
