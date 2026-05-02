using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Commands.UpdateReservation;

public record UpdateReservationCommand(
    Guid Id,
    ReservationStatus? Status,
    Guid? PaymentId
) : IRequest<bool>;
