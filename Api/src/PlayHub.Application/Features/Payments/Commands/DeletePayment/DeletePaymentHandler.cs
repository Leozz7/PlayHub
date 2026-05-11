using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Payments.Commands.DeletePayment;

public class DeletePaymentHandler : IRequestHandler<DeletePaymentCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeletePaymentHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeletePaymentCommand request, CancellationToken cancellationToken)
    {
        var paymentFilter = Builders<Payment>.Filter.Eq(p => p.Id, request.Id);
        var payment = await _context.Payments.Find(paymentFilter).FirstOrDefaultAsync(cancellationToken);

        if (payment == null)
            return false;

        if (!_currentUserService.IsAdmin)
        {
            if (_currentUserService.IsManager)
            {
                var reservation = await _context.Reservations
                    .Find(r => r.Id == payment.ReservationId)
                    .FirstOrDefaultAsync(cancellationToken);

                if (reservation == null || !_currentUserService.IsAuthorizedForCourt(reservation.CourtId))
                    return false;
            }
            else if (payment.UserId != _currentUserService.UserId)
            {
                return false;
            }
        }

        var result = await _context.Payments.DeleteOneAsync(paymentFilter, cancellationToken);

        return result.DeletedCount > 0;
    }
}
