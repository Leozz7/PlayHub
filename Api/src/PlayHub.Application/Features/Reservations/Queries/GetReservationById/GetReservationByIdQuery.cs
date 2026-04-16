using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Reservations.Dtos;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Queries.GetReservationById;

public record GetReservationByIdQuery(Guid Id) : IRequest<ReservationDto?>;

public class GetReservationByIdHandler : IRequestHandler<GetReservationByIdQuery, ReservationDto?>
{
    private readonly IApplicationDbContext _context;

    public GetReservationByIdHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReservationDto?> Handle(GetReservationByIdQuery request, CancellationToken cancellationToken)
    {
        var filter = Builders<Domain.Entities.Reservation>.Filter.Eq(r => r.Id, request.Id);
        var reservation = await _context.Reservations.Find(filter).FirstOrDefaultAsync(cancellationToken);

        if (reservation == null)
            return null;

        return new ReservationDto
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
        };
    }
}
