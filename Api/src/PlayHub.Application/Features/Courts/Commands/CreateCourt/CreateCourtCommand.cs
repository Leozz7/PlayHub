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
    Guid? CurrentUserId = null,
    string? CurrentUserRole = null
) : IRequest<CourtDto>;
