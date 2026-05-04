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

using PlayHub.Application.Features.Courts.Queries.GetCourts;

namespace PlayHub.Application.Features.Reservations.Queries.GetReservations;

public record GetReservationsQuery(
    Guid? CourtId = null,
    Guid? UserId = null,
    ReservationStatus? Status = null,
    DateTime? Date = null,
    int PageNumber = 1,
    int PageSize = 25
) : IRequest<PagedResult<ReservationDto>>;
