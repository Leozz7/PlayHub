using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Enums;
using System.Collections.Generic;

namespace PlayHub.Application.Features.Courts.Commands.UpdateCourt;

public class UpdateCourtHandler : IRequestHandler<UpdateCourtCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateCourtHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateCourtCommand request, CancellationToken cancellationToken)
    {
        var court = await _context.Courts
            .Find(c => c.Id == request.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (court == null) return false;

        court.UpdateDetails(
            request.Name,
            request.Type,
            request.HourlyRate,
            request.Capacity,
            request.Description
        );

        court.UpdateLocation(request.Address, request.Neighborhood, request.City, request.State);
        court.UpdateBusinessData(request.OldPrice, request.Badge, request.Rating, request.ReviewCount);
        court.UpdateSchedule(request.OpeningHour, request.ClosingHour);

        if (request.Sports != null)
        {
            court.UpdateSports(request.Sports);
        }

        if (request.Amenities != null)
        {
            court.UpdateAmenities(request.Amenities);
        }

        if (request.ImageUrls != null)
        {
            court.UpdateImages(request.ImageUrls);
        }

        if (request.Schedules != null)
        {
            court.UpdateComplexSchedule(request.Schedules.Select(s => new Domain.Entities.OperatingDay
            {
                Day = s.Day,
                OpeningHour = s.OpeningHour,
                ClosingHour = s.ClosingHour,
                IsClosed = s.IsClosed
            }));
        }


        // Process Binary Images
        if (!string.IsNullOrEmpty(request.MainImageBase64) || request.ImagesBase64 != null)
        {
            byte[]? mainImageBytes = court.MainImage;
            if (!string.IsNullOrEmpty(request.MainImageBase64))
            {
                mainImageBytes = Convert.FromBase64String(ExtractBase64(request.MainImageBase64));
            }

            var imagesBytes = court.Images.ToList();
            if (request.ImagesBase64 != null)
            {
                imagesBytes = request.ImagesBase64.Select(ExtractBase64).Select(Convert.FromBase64String).ToList();
            }

            court.UpdateBinaryImages(mainImageBytes, imagesBytes);
        }

        if (request.Status.HasValue)
        {
            switch (request.Status.Value)
            {
                case CourtStatus.Active:
                    court.RestoreToService();
                    break;
                case CourtStatus.Maintenance:
                    court.MarkUnderMaintenance();
                    break;
                case CourtStatus.Inactive:
                    court.Deactivate();
                    break;
            }
        }

        var result = await _context.Courts.ReplaceOneAsync(
            c => c.Id == court.Id, 
            court, 
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }

    private string ExtractBase64(string base64WithPrefix)
    {
        if (string.IsNullOrEmpty(base64WithPrefix)) return string.Empty;
        var parts = base64WithPrefix.Split(',');
        return parts[^1];
    }
}
