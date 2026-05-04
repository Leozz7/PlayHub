using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Payments.Commands.ProcessPayment;

public class ProcessPaymentHandler : IRequestHandler<ProcessPaymentCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ProcessPaymentHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ProcessPaymentCommand request, CancellationToken cancellationToken)
    {
        var paymentFilter = Builders<Payment>.Filter.Eq(p => p.Id, request.PaymentId);
        var payment = await _context.Payments.Find(paymentFilter).FirstOrDefaultAsync(cancellationToken);

        if (payment == null)
            return false;

        payment.ProcessPayment(request.TransactionId, request.PaymentDate);

        var paymentUpdateResult = await _context.Payments.ReplaceOneAsync(
            paymentFilter,
            payment,
            new ReplaceOptions { IsUpsert = false },
            cancellationToken);

        if (paymentUpdateResult.ModifiedCount == 0)
            return false;

        var reservationFilter = Builders<Reservation>.Filter.Eq(r => r.Id, payment.ReservationId);
        var reservation = await _context.Reservations.Find(reservationFilter).FirstOrDefaultAsync(cancellationToken);

        if (reservation != null)
        {
            reservation.UpdateStatus(ReservationStatus.Confirmed);
            await _context.Reservations.ReplaceOneAsync(
                reservationFilter,
                reservation,
                new ReplaceOptions { IsUpsert = false },
                cancellationToken);
        }

        return true;
    }
}
