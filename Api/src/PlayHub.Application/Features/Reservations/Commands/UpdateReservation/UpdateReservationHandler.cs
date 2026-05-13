using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Commands.UpdateReservation;

public class UpdateReservationHandler : IRequestHandler<UpdateReservationCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateReservationHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(UpdateReservationCommand request, CancellationToken cancellationToken)
    {
        var filter = Builders<Reservation>.Filter.Eq(r => r.Id, request.Id);
        var reservation = await _context.Reservations.Find(filter).FirstOrDefaultAsync(cancellationToken);

        if (reservation == null)
            return false;

        if (!_currentUserService.IsAdmin)
        {
            if (_currentUserService.IsManager)
            {
                if (!_currentUserService.IsAuthorizedForCourt(reservation.CourtId))
                    return false;
            }
            else if (reservation.UserId != _currentUserService.UserId)
            {
                return false; 
            }
        }

        bool updated = false;

        if (request.Status.HasValue)
        {
            reservation.UpdateStatus(request.Status.Value);
            updated = true;
        }

        if (request.PaymentId.HasValue)
        {
            reservation.SetPaymentId(request.PaymentId.Value);
            updated = true;
        }

        if (updated)
        {
            var updateResult = await _context.Reservations.ReplaceOneAsync(
                filter,
                reservation,
                new ReplaceOptions { IsUpsert = false },
                cancellationToken);

            return updateResult.ModifiedCount > 0;
        }

        return true;
    }
}
