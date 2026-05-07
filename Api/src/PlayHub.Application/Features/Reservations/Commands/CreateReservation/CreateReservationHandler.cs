using MediatR;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Reservations.Dtos;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using MongoDB.Driver;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Commands.CreateReservation;

public class CreateReservationHandler : IRequestHandler<CreateReservationCommand, ReservationDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;

    private readonly INotificationService _notificationService;

    public CreateReservationHandler(IApplicationDbContext context, IEncryptionService encryptionService, INotificationService notificationService)
    {
        _context = context;
        _encryptionService = encryptionService;
        _notificationService = notificationService;
    }

    public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        // Verificar se já existe uma reserva para este horário e quadra
        var conflict = await _context.Reservations
            .Find(r => r.CourtId == request.CourtId && 
                       r.Status != ReservationStatus.Cancelled &&
                       r.StartTime < request.EndTime && 
                       r.EndTime > request.StartTime)
            .AnyAsync(cancellationToken);

        if (conflict)
        {
            throw new Exception("Esta quadra já está reservada para o horário selecionado.");
        }

        var reservation = new Reservation(
            request.CourtId,
            request.UserId,
            request.StartTime,
            request.EndTime,
            request.TotalPrice,
            request.Status
        );

        await _context.Reservations.InsertOneAsync(reservation, cancellationToken: cancellationToken);

        // SignalR
        await _notificationService.NotifyReservationCreated(reservation.CourtId.ToString(), reservation.StartTime.ToString("o"));

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
            StartTime = reservation.StartTime,
            EndTime = reservation.EndTime,
            Status = reservation.Status,
            TotalPrice = reservation.TotalPrice,
            PaymentId = reservation.PaymentId,
            Created = reservation.Created
        };
    }
}
