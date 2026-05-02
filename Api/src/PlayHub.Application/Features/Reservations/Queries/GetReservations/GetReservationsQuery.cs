using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Reservations.Dtos;
using PlayHub.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Queries.GetReservations;

public record GetReservationsQuery(
    Guid? CourtId = null,
    Guid? UserId = null,
    ReservationStatus? Status = null
) : IRequest<List<ReservationDto>>;
