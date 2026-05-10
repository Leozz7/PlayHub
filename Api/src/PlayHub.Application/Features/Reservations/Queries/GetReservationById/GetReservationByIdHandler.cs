using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Reservations.Dtos;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Queries.GetReservationById;

public class GetReservationByIdHandler : IRequestHandler<GetReservationByIdQuery, ReservationDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public GetReservationByIdHandler(IApplicationDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<ReservationDto?> Handle(GetReservationByIdQuery request, CancellationToken cancellationToken)
    {
        var filter = Builders<Domain.Entities.Reservation>.Filter.Eq(r => r.Id, request.Id);
        var reservation = await _context.Reservations.Find(filter).FirstOrDefaultAsync(cancellationToken);

        if (reservation == null)
            return null;

        var court = await _context.Courts.Find(c => c.Id == reservation.CourtId).FirstOrDefaultAsync(cancellationToken);
        var user = await _context.Users.Find(u => u.Id == reservation.UserId).FirstOrDefaultAsync(cancellationToken);

        return new ReservationDto
        {
            Id = reservation.Id,
            CourtId = reservation.CourtId,
            CourtName = court?.Name,
            CourtSport = court?.Type.ToString(),
            UserId = reservation.UserId,
            UserName = user?.Name,
            UserEmail = user?.Email != null ? _encryptionService.Decrypt(user.Email) : null,
            UserPhone = user?.Phone != null ? _encryptionService.Decrypt(user.Phone) : null,
            UserCpf = user?.Cpf != null ? _encryptionService.Decrypt(user.Cpf) : null,
            StartTime = reservation.StartTime,
            EndTime = reservation.EndTime,
            Status = reservation.Status,
            TotalPrice = reservation.TotalPrice,
            PaymentId = reservation.PaymentId,
            Created = reservation.Created
        };
    }
}
