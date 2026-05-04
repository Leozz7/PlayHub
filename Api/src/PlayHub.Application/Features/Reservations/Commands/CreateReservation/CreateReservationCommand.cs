using MediatR;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Reservations.Dtos;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Commands.CreateReservation;

public record CreateReservationCommand(
    Guid CourtId,
    Guid UserId,
    DateTime StartTime,
    DateTime EndTime,
    decimal TotalPrice,
    ReservationStatus Status = ReservationStatus.Pending
) : IRequest<ReservationDto>;
