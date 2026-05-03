using MediatR;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using MongoDB.Driver;
using System.Linq;

namespace PlayHub.Application.Features.Courts.Commands.CreateCourt;

public record CreateCourtCommand(
    string Name,
    CourtType Type,
    decimal HourlyRate,
    int Capacity,
    string? Description = null,
    List<CourtAmenity>? Amenities = null,
    List<string>? ImageUrls = null,
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
    List<string>? Sports = null,
    List<OperatingDayDto>? Schedules = null,
    string? MainImageBase64 = null,
    List<string>? ImagesBase64 = null,
    Guid? CurrentUserId = null,
    string? CurrentUserRole = null
) : IRequest<CourtDto>;

