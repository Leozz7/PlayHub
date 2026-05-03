using MediatR;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;
using MongoDB.Driver;
using System.Linq;

namespace PlayHub.Application.Features.Courts.Commands.CreateCourt;

public class CreateCourtHandler : IRequestHandler<CreateCourtCommand, CourtDto>
{
    private readonly IApplicationDbContext _context;

    public CreateCourtHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CourtDto> Handle(CreateCourtCommand request, CancellationToken cancellationToken)
    {
        var court = new Court(
            request.Name,
            request.Type,
            request.HourlyRate,
            request.Capacity,
            request.Description
        );

        court.UpdateLocation(request.Address, request.Neighborhood, request.City, request.State);
        court.UpdateBusinessData(request.OldPrice, request.Badge, request.Rating, request.ReviewCount);
        court.UpdateSchedule(request.OpeningHour, request.ClosingHour);

        if (request.Sports != null && request.Sports.Any())
        {
            court.UpdateSports(request.Sports);
        }
        else
        {
            court.UpdateSports(new List<string> { request.Type.ToString() });
        }

        if (request.Amenities != null)
        {
            court.UpdateAmenities(request.Amenities);
        }

        if (request.ImageUrls != null)
        {
            court.UpdateImages(request.ImageUrls);
        }

        await _context.Courts.InsertOneAsync(court, cancellationToken: cancellationToken);

        if (request.CurrentUserId.HasValue && request.CurrentUserRole == "Manager")
        {
            var user = await _context.Users.Find(u => u.Id == request.CurrentUserId.Value).FirstOrDefaultAsync(cancellationToken);
            if (user != null)
            {
                user.AddCourt(court.Id);
                await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);
            }
        }

        return new CourtDto
        {
            Id = court.Id,
            Name = court.Name,
            Type = court.Type,
            HourlyRate = court.HourlyRate,
            Status = court.Status,
            Capacity = court.Capacity,
            Description = court.Description,
            Amenities = court.Amenities.ToList(),
            ImageUrls = court.ImageUrls.ToList(),
            Created = court.Created,
            
            Address = court.Address,
            Neighborhood = court.Neighborhood,
            City = court.City,
            State = court.State,
            Location = string.IsNullOrWhiteSpace(court.City) ? "" : $"{court.City} • {court.Neighborhood}",
            
            OldPrice = court.OldPrice,
            Badge = court.Badge,
            Rating = court.Rating,
            ReviewCount = court.ReviewCount,
            Price = court.HourlyRate,
            
            OpeningHour = court.OpeningHour,
            ClosingHour = court.ClosingHour,
            
            Sport = court.Type.ToString(),
            Sports = court.Sports.ToList(),
            
            Img = court.ImageUrls.FirstOrDefault() ?? string.Empty
        };
    }
}
