using MediatR;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Reservations.Dtos;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Commands.CreateReservation;

public class CreateReservationHandler : IRequestHandler<CreateReservationCommand, ReservationDto>
{
    private readonly IApplicationDbContext _context;

    public CreateReservationHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = new Reservation(
            request.CourtId,
            request.UserId,
            request.StartTime,
            request.EndTime,
            request.TotalPrice,
            request.Status
        );

        await _context.Reservations.InsertOneAsync(reservation, cancellationToken: cancellationToken);

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
