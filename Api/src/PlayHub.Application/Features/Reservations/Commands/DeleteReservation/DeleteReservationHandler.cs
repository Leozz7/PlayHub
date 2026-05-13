using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Commands.DeleteReservation;

public class DeleteReservationHandler : IRequestHandler<DeleteReservationCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteReservationHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(DeleteReservationCommand request, CancellationToken cancellationToken)
    {
        var filter = Builders<Domain.Entities.Reservation>.Filter.Eq(r => r.Id, request.Id);
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

        var result = await _context.Reservations.DeleteOneAsync(filter, cancellationToken);
        
        return result.DeletedCount > 0;
    }
}
