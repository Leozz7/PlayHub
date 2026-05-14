using MediatR;

namespace PlayHub.Application.Features.Reservations.Commands.CancelRecurringReservation;

public record CancelRecurringReservationCommand(Guid RecurringGroupId) : IRequest<CancelRecurringReservationResult>;

public record CancelRecurringReservationResult(
    int ReservationsCancelled,
    int InvoicesUpdated
);
