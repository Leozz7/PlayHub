using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Common;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;

namespace PlayHub.Application.Features.Reservations.Commands.CancelRecurringReservation;

public class CancelRecurringReservationHandler
    : IRequestHandler<CancelRecurringReservationCommand, CancelRecurringReservationResult>
{
    private readonly IApplicationDbContext _context;

    public CancelRecurringReservationHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CancelRecurringReservationResult> Handle(
        CancelRecurringReservationCommand request,
        CancellationToken cancellationToken)
    {
        if (request.RecurringGroupId == Guid.Empty)
            throw new DomainException("RecurringGroupId é obrigatório.");

        var now = DateTime.UtcNow;

        // apenas reservas futuras não canceladas
        var reservationFilter = Builders<Domain.Entities.Reservation>.Filter.And(
            Builders<Domain.Entities.Reservation>.Filter.Eq(r => r.RecurringGroupId, request.RecurringGroupId),
            Builders<Domain.Entities.Reservation>.Filter.Gt(r => r.StartTime, now),
            Builders<Domain.Entities.Reservation>.Filter.Ne(r => r.Status, ReservationStatus.Cancelled));

        var reservationUpdate = Builders<Domain.Entities.Reservation>.Update
            .Set(r => r.Status, ReservationStatus.Cancelled)
            .Set(r => r.LastModified, now);

        var reservationResult = await _context.Reservations.UpdateManyAsync(
            reservationFilter, reservationUpdate, cancellationToken: cancellationToken);

        // cancela faturas futuras não pagas
        var invoiceFilter = Builders<Domain.Entities.Invoice>.Filter.And(
            Builders<Domain.Entities.Invoice>.Filter.Eq(i => i.RecurringGroupId, request.RecurringGroupId),
            Builders<Domain.Entities.Invoice>.Filter.Ne(i => i.Status, InvoiceStatus.Paid));

        // mantém faturas mas cancela apenas aquelas cujo mês/ano está no futuro
        var currentYear  = now.Year;
        var currentMonth = now.Month;

        var futureInvoiceFilter = Builders<Domain.Entities.Invoice>.Filter.And(
            invoiceFilter,
            Builders<Domain.Entities.Invoice>.Filter.Or(
                Builders<Domain.Entities.Invoice>.Filter.Gt(i => i.Year, currentYear),
                Builders<Domain.Entities.Invoice>.Filter.And(
                    Builders<Domain.Entities.Invoice>.Filter.Eq(i => i.Year, currentYear),
                    Builders<Domain.Entities.Invoice>.Filter.Gt(i => i.Month, currentMonth))));

        var invoiceUpdate = Builders<Domain.Entities.Invoice>.Update
            .Set(i => i.Status, InvoiceStatus.Overdue)
            .Set(i => i.LastModified, now);

        var invoiceResult = await _context.Invoices.UpdateManyAsync(
            futureInvoiceFilter, invoiceUpdate, cancellationToken: cancellationToken);

        return new CancelRecurringReservationResult(
            (int)reservationResult.ModifiedCount,
            (int)invoiceResult.ModifiedCount);
    }
}
