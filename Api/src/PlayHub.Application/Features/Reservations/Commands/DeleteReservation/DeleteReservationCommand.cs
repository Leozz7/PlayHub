using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Commands.DeleteReservation;

public record DeleteReservationCommand(Guid Id) : IRequest<bool>;

public class DeleteReservationHandler : IRequestHandler<DeleteReservationCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteReservationHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteReservationCommand request, CancellationToken cancellationToken)
    {
        var filter = Builders<Domain.Entities.Reservation>.Filter.Eq(r => r.Id, request.Id);
        var result = await _context.Reservations.DeleteOneAsync(filter, cancellationToken);
        
        return result.DeletedCount > 0;
    }
}
