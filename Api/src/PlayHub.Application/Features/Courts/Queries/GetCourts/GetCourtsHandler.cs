using System;
using MediatR;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Enums;
using PlayHub.Domain.Constants;
using System.Collections.Generic;
using System.Linq;
using PlayHub.Domain.Entities;
using PlayHub.Application.Common.Extensions;

namespace PlayHub.Application.Features.Courts.Queries.GetCourts;

public class GetCourtsHandler : IRequestHandler<GetCourtsQuery, PagedResult<CourtDto>>
{
    private readonly ICourtRepository _courtRepository;

    public GetCourtsHandler(ICourtRepository courtRepository)
    {
        _courtRepository = courtRepository;
    }

    public async Task<PagedResult<CourtDto>> Handle(GetCourtsQuery request, CancellationToken cancellationToken)
    {
        var currentHour = request.Hour ?? (DateTime.UtcNow.AddHours(-3).Hour);
        
        var (courts, totalCount) = await _courtRepository.GetPagedCourtsAsync(request, cancellationToken);

        var items = courts.Select(court => 
        {
            var isClosed = currentHour < court.OpeningHour || currentHour >= court.ClosingHour;
            var frontendStatus = isClosed ? "closed" : (court.Status == CourtStatus.Active ? "available" : "busy");

            return new CourtDto
            {
                Id = court.Id,
                Name = court.Name,
                Type = court.Type,
                HourlyRate = court.HourlyRate,
                Status = court.Status,
                Capacity = court.Capacity,
                Description = court.Description,
                Amenities = (court.Amenities ?? Array.Empty<string>()).ToList(),
                ImageUrls = (court.ImageUrls ?? Array.Empty<string>()).ToList(),
                Created = court.Created,

                Address = court.Address,
                Neighborhood = court.Neighborhood,
                City = court.City,
                State = court.State,
                Location = string.IsNullOrWhiteSpace(court.City) ? "" : $"{court.City} • {court.Neighborhood}",
                
                OldPrice = court.OldPrice,
                Badge = court.Badge,
                Rating = court.ReviewCount == 0 ? 5.0 : court.Rating,
                ReviewCount = court.ReviewCount,
                Price = court.HourlyRate,
                
                OpeningHour = court.OpeningHour,
                ClosingHour = court.ClosingHour,
                
                Sport = court.ToFriendlySportString(),
                Sports = (court.Sports ?? Array.Empty<string>()).ToList(),
                
                Img = court.MainImage != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(court.MainImage)}" : ((court.ImageUrls ?? Array.Empty<string>()).FirstOrDefault() ?? string.Empty),
                FrontendStatus = frontendStatus,
                AvailableToday = !isClosed,

                MainImageBase64 = court.MainImage != null ? $"data:image/jpeg;base64,{Convert.ToBase64String(court.MainImage)}" : null,
                ImagesBase64 = (court.Images ?? Enumerable.Empty<byte[]>()).Select(img => $"data:image/jpeg;base64,{Convert.ToBase64String(img)}").ToList(),
                Schedules = (court.Schedules ?? Enumerable.Empty<PlayHub.Domain.Entities.OperatingDay>()).Select(s => new OperatingDayDto
                {
                    Day = s.Day,
                    OpeningHour = s.OpeningHour,
                    ClosingHour = s.ClosingHour,
                    IsClosed = s.IsClosed
                }).ToList()

            };
        }).ToList();

        return new PagedResult<CourtDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}

