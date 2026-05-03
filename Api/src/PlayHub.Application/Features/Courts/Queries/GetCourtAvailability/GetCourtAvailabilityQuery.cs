using MediatR;
using PlayHub.Application.Features.Courts.Dtos;
using System;

namespace PlayHub.Application.Features.Courts.Queries.GetCourtAvailability;

public record GetCourtAvailabilityQuery(
    Guid CourtId,
    DateTime Date
) : IRequest<CourtAvailabilityDto>;
