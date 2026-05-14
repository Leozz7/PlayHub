using MediatR;
using PlayHub.Application.Features.Invoices.Dtos;
using PlayHub.Application.Features.Reservations.Dtos;

namespace PlayHub.Application.Features.Reservations.Commands.CreateRecurringReservation;

public record CreateRecurringReservationCommand(
    Guid CourtId,
    Guid UserId,
    DateTime FirstStartTime,
    DateTime FirstEndTime,
    int MonthsToBlock
) : IRequest<CreateRecurringReservationResult>;

public record CreateRecurringReservationResult(
    Guid RecurringGroupId,
    List<ReservationDto> Reservations,
    List<InvoiceDto> Invoices
);
