using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Invoices.Dtos;
using PlayHub.Application.Features.Reservations.Dtos;
using PlayHub.Domain.Common.Exceptions;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;

namespace PlayHub.Application.Features.Reservations.Commands.CreateRecurringReservation;

public class CreateRecurringReservationHandler
    : IRequestHandler<CreateRecurringReservationCommand, CreateRecurringReservationResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public CreateRecurringReservationHandler(
        IApplicationDbContext context,
        IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<CreateRecurringReservationResult> Handle(
        CreateRecurringReservationCommand request,
        CancellationToken cancellationToken)
    {
        // busca por quadra e usuario
        var court = await _context.Courts
            .Find(c => c.Id == request.CourtId)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(nameof(Court), request.CourtId);

        if (!court.CanBeBooked())
            throw new ConflictException($"A quadra '{court.Name}' não está disponível para reservas.");

        var user = await _context.Users
            .Find(u => u.Id == request.UserId)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(nameof(User), request.UserId);

        // gera os slots de horário
        var slotDuration   = request.FirstEndTime - request.FirstStartTime;
        var rangeEnd       = request.FirstStartTime.AddMonths(request.MonthsToBlock);
        var slotsToCreate  = new List<(DateTime start, DateTime end)>();

        var cursor = request.FirstStartTime;
        while (cursor < rangeEnd)
        {
            slotsToCreate.Add((cursor, cursor + slotDuration));
            cursor = cursor.AddDays(7);
        }

        // Busca por reservas existentes no período
        var periodStart = slotsToCreate[0].start;
        var periodEnd   = slotsToCreate[^1].end;

        var existing = await _context.Reservations
            .Find(r => r.CourtId  == request.CourtId
                    && r.Status   != ReservationStatus.Cancelled
                    && r.StartTime < periodEnd
                    && r.EndTime   > periodStart)
            .ToListAsync(cancellationToken);

        // Verifica conflitos de horário
        foreach (var (start, end) in slotsToCreate)
        {
            var conflict = existing.Any(r => r.StartTime < end && r.EndTime > start);
            if (conflict)
                throw new ConflictException(
                    $"Conflito de horário detectado em {start:dd/MM/yyyy HH:mm}. Pacote não criado.");
        }

        // Cria as reservas
        var groupId       = Guid.NewGuid();
        var totalPrice    = court.CalculateTotalPrice(request.FirstStartTime, request.FirstEndTime);
        var reservations  = slotsToCreate
            .Select(s => Reservation.CreateRecurring(
                request.CourtId, request.UserId, s.start, s.end, totalPrice, groupId))
            .ToList();

        // Gera as faturas
        var invoices = reservations
            .GroupBy(r => new { r.StartTime.Year, r.StartTime.Month })
            .Select(g => new Invoice(
                userId:           request.UserId,
                recurringGroupId: groupId,
                month:            g.Key.Month,
                year:             g.Key.Year,
                totalAmount:      g.Sum(r => r.TotalPrice),
                reservationIds:   g.Select(r => r.Id)))
            .ToList();

        // Salva as reservas e faturas
        using var session = await _context.Reservations.Database.Client
            .StartSessionAsync(cancellationToken: cancellationToken);

        session.StartTransaction();
        try
        {
            await _context.Reservations.InsertManyAsync(session, reservations, cancellationToken: cancellationToken);
            await _context.Invoices.InsertManyAsync(session, invoices, cancellationToken: cancellationToken);
            await session.CommitTransactionAsync(cancellationToken);
        }
        catch
        {
            await session.AbortTransactionAsync(cancellationToken);
            throw;
        }

        var userName  = user.Name;
        var userEmail = user.Email  is not null ? _encryptionService.Decrypt(user.Email)  : null;

        var reservationDtos = reservations.Select(r => new ReservationDto
        {
            Id               = r.Id,
            CourtId          = r.CourtId,
            CourtName        = court.Name,
            CourtSport       = court.Type.ToString(),
            UserId           = r.UserId,
            UserName         = userName,
            UserEmail        = userEmail,
            StartTime        = r.StartTime,
            EndTime          = r.EndTime,
            Status           = r.Status,
            TotalPrice       = r.TotalPrice,
            Created          = r.Created,
            IsRecurring      = r.IsRecurring,
            RecurringGroupId = r.RecurringGroupId
        }).ToList();

        var invoiceDtos = invoices.Select(i => new InvoiceDto
        {
            Id               = i.Id,
            UserId           = i.UserId,
            UserName         = userName,
            UserEmail        = userEmail,
            RecurringGroupId = i.RecurringGroupId,
            Month            = i.Month,
            Year             = i.Year,
            TotalAmount      = i.TotalAmount,
            Status           = i.Status,
            ReservationIds   = i.ReservationIds.ToList(),
            Created          = i.Created
        }).ToList();

        return new CreateRecurringReservationResult(groupId, reservationDtos, invoiceDtos);
    }
}
