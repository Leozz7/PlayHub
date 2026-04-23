using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Payments.Dtos;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Payments.Commands.CreatePayment;

public record CreatePaymentCommand(
    Guid ReservationId,
    Guid UserId,
    decimal Amount,
    PaymentMethod Method,
    PaymentStatus Status = PaymentStatus.Pending
) : IRequest<PaymentDto>;

public class CreatePaymentHandler : IRequestHandler<CreatePaymentCommand, PaymentDto>
{
    private readonly IApplicationDbContext _context;

    public CreatePaymentHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentDto> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
    {
        var reservationFilter = Builders<Reservation>.Filter.Eq(r => r.Id, request.ReservationId);
        var reservation = await _context.Reservations.Find(reservationFilter).FirstOrDefaultAsync(cancellationToken);

        if (reservation == null)
            throw new Exception($"Reservation with ID {request.ReservationId} not found.");

        var payment = new Payment(
            request.ReservationId,
            request.UserId,
            request.Amount,
            request.Method,
            request.Status
        );

        await _context.Payments.InsertOneAsync(payment, cancellationToken: cancellationToken);

        reservation.SetPaymentId(payment.Id);
        await _context.Reservations.ReplaceOneAsync(
            reservationFilter,
            reservation,
            new ReplaceOptions { IsUpsert = false },
            cancellationToken);

        return new PaymentDto
        {
            Id = payment.Id,
            ReservationId = payment.ReservationId,
            UserId = payment.UserId,
            Amount = payment.Amount,
            Status = payment.Status,
            Method = payment.Method,
            PaymentDate = payment.PaymentDate,
            TransactionId = payment.TransactionId,
            Created = payment.Created
        };
    }
}
