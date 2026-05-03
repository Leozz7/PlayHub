using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Enums;
using System.Collections.Generic;

namespace PlayHub.Application.Features.Courts.Commands.UpdateCourt;

public record UpdateCourtCommand(
    Guid Id,
    string Name,
    CourtType Type,
    decimal HourlyRate,
    int Capacity,
    string? Description = null,
    List<CourtAmenity>? Amenities = null,
    List<string>? ImageUrls = null,
    CourtStatus? Status = null,
    string Address = "",
    string Neighborhood = "",
    string City = "",
    string State = "",
    decimal? OldPrice = null,
    string? Badge = null,
    double Rating = 5.0,
    int ReviewCount = 0,
    int OpeningHour = 6,
    int ClosingHour = 23,
    List<string>? Sports = null
) : IRequest<bool>;
