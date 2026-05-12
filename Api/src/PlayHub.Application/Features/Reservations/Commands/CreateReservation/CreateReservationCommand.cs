using MediatR;
using PlayHub.Application.Features.Reservations.Dtos;

namespace PlayHub.Application.Features.Reservations.Commands.CreateReservation;

public record CreateReservationCommand(
    Guid CourtId,
    Guid UserId,
    DateTime StartTime,
    DateTime EndTime
) : IRequest<ReservationDto>;
