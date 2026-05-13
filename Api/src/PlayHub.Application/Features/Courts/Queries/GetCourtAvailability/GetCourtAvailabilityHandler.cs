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
            throw new Exception("Quadra não encontrada");
        }

        var targetDate = request.Date.Date;
        var startUtcSearch = targetDate.AddDays(-1);
        var endUtcSearch = targetDate.AddDays(2);

        // criando filtro por data
        var filterBuilder = Builders<Reservation>.Filter;
        var filter = filterBuilder.Eq(r => r.CourtId, request.CourtId) &
                     filterBuilder.Gte(r => r.StartTime, startUtcSearch) &
                     filterBuilder.Lt(r => r.StartTime, endUtcSearch) &
                     filterBuilder.Ne(r => r.Status, PlayHub.Domain.Enums.ReservationStatus.Cancelled);

        var reservations = await _context.Reservations
            .Find(filter)
            .ToListAsync(cancellationToken);

        var busySlots = new HashSet<int>();

        // preenchendo horarios ocupados
        foreach (var reservation in reservations)
        {
            var localStart = reservation.StartTime.AddHours(-3);
            var localEnd = reservation.EndTime.AddHours(-3);

            for (var slot = localStart; slot < localEnd; slot = slot.AddHours(1))
            {
                if (slot.Date == targetDate)
                {
                    busySlots.Add(slot.Hour);
                }
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
