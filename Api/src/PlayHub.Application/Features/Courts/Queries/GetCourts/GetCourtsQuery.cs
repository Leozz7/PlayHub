using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Enums;
using System.Collections.Generic;
using System.Linq;

namespace PlayHub.Application.Features.Courts.Queries.GetCourts;

public record GetCourtsQuery(
    CourtType? Type = null,
    CourtStatus? Status = null,
    string? CurrentUserRole = null,
    List<Guid>? UserCourtIds = null
) : IRequest<List<CourtDto>>;
