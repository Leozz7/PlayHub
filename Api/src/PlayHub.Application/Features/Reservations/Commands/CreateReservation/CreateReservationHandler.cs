using MediatR;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Reservations.Dtos;
using PlayHub.Domain.Common.Exceptions;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using MongoDB.Driver;

namespace PlayHub.Application.Features.Reservations.Commands.CreateReservation;

public class CreateReservationHandler : IRequestHandler<CreateReservationCommand, ReservationDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;
    private readonly INotificationService _notificationService;

    public CreateReservationHandler(
        IApplicationDbContext context,
        IEncryptionService encryptionService,
        INotificationService notificationService)
    {
        _context = context;
        _encryptionService = encryptionService;
        _notificationService = notificationService;
    }

    public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        var court = await _context.Courts
            .Find(c => c.Id == request.CourtId)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(nameof(Court), request.CourtId);

        if (!court.CanBeBooked())
            throw new ConflictException($"A quadra '{court.Name}' não está disponível para reservas no momento.");

        var hasConflict = await _context.Reservations
            .Find(r => r.CourtId == request.CourtId
                    && r.Status != ReservationStatus.Cancelled
                    && r.StartTime < request.EndTime
                    && r.EndTime > request.StartTime)
            .AnyAsync(cancellationToken);

        if (hasConflict)
            throw new ConflictException("Esta quadra já está reservada para o horário selecionado.");

        // calculo preço da reserva
        var totalPrice = court.CalculateTotalPrice(request.StartTime, request.EndTime);

        var reservation = new Reservation(
            request.CourtId,
            request.UserId,
            request.StartTime,
            request.EndTime,
            totalPrice
        );

        await _context.Reservations.InsertOneAsync(reservation, cancellationToken: cancellationToken);

        // notificação
        await _notificationService.NotifyReservationCreated(
            reservation.CourtId.ToString(),
            reservation.StartTime.ToString("o"));

        var user = await _context.Users
            .Find(u => u.Id == reservation.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        return new ReservationDto
        {
            Id          = reservation.Id,
            CourtId     = reservation.CourtId,
            CourtName   = court.Name,
            CourtSport  = court.Type.ToString(),
            UserId      = reservation.UserId,
            UserName    = user?.Name,
            UserEmail   = user?.Email is not null ? _encryptionService.Decrypt(user.Email) : null,
            UserPhone   = user?.Phone is not null ? _encryptionService.Decrypt(user.Phone) : null,
            UserCpf     = user?.Cpf is not null ? _encryptionService.Decrypt(user.Cpf) : null,
            StartTime   = reservation.StartTime,
            EndTime     = reservation.EndTime,
            Status      = reservation.Status,
            TotalPrice  = reservation.TotalPrice,
            PaymentId   = reservation.PaymentId,
            Created     = reservation.Created
        };
    }
}
