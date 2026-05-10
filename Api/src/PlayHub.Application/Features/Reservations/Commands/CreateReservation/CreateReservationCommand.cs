using MediatR;
using PlayHub.Application.Features.Reservations.Dtos;

namespace PlayHub.Application.Features.Reservations.Commands.CreateReservation;

/// <summary>
/// O TotalPrice é calculado no backend para evitar manipulação de preços.
/// </summary>
public record CreateReservationCommand(
    Guid CourtId,
    Guid UserId,
    DateTime StartTime,
    DateTime EndTime
) : IRequest<ReservationDto>;
