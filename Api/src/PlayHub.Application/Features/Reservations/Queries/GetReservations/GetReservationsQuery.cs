using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Reservations.Dtos;
using PlayHub.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Queries.GetReservations;

public record GetReservationsQuery(
    Guid? CourtId = null,
    Guid? UserId = null,
    ReservationStatus? Status = null
) : IRequest<List<ReservationDto>>;

public class GetReservationsHandler : IRequestHandler<GetReservationsQuery, List<ReservationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetReservationsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReservationDto>> Handle(GetReservationsQuery request, CancellationToken cancellationToken)
    {
        var filterBuilder = Builders<Domain.Entities.Reservation>.Filter;
        var filter = filterBuilder.Empty;

        if (request.CourtId.HasValue)
        {
            filter &= filterBuilder.Eq(r => r.CourtId, request.CourtId.Value);
        }

        if (request.UserId.HasValue)
        {
            filter &= filterBuilder.Eq(r => r.UserId, request.UserId.Value);
        }

        if (request.Status.HasValue)
        {
            filter &= filterBuilder.Eq(r => r.Status, request.Status.Value);
        }

        var reservations = await _context.Reservations
            .Find(filter)
            .ToListAsync(cancellationToken);

        return reservations.Select(reservation => new ReservationDto
        {
            Id = reservation.Id,
            CourtId = reservation.CourtId,
            UserId = reservation.UserId,
            StartTime = reservation.StartTime,
            EndTime = reservation.EndTime,
            Status = reservation.Status,
            TotalPrice = reservation.TotalPrice,
            PaymentId = reservation.PaymentId,
            Created = reservation.Created
        }).ToList();
    }
}
