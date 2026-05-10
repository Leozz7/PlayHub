using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Dashboard.Dtos;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;

namespace PlayHub.Application.Features.Dashboard.Queries.GetDashboardTopCourts;

public class GetDashboardTopCourtsHandler : IRequestHandler<GetDashboardTopCourtsQuery, List<TopCourtDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetDashboardTopCourtsHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<List<TopCourtDto>> Handle(GetDashboardTopCourtsQuery request, CancellationToken cancellationToken)
    {
        var managerId = _currentUserService.UserId;
        var isManagerOrAdmin = _currentUserService.IsManager || _currentUserService.IsAdmin;

        if (!isManagerOrAdmin)
        {
            return new List<TopCourtDto>();
        }

        var managerCourtIds = _currentUserService.CourtIds;
        if (managerCourtIds == null || !managerCourtIds.Any())
        {
            return new List<TopCourtDto>();
        }

        var courtFilter = Builders<Court>.Filter.In(c => c.Id, managerCourtIds);
        var courts = await _context.Courts.Find(courtFilter).ToListAsync(cancellationToken);
        var courtIds = courts.Select(c => c.Id).ToList();

        if (!courtIds.Any()) return new List<TopCourtDto>();

        var reservationFilter = Builders<Reservation>.Filter.In(r => r.CourtId, courtIds);
        var reservations = await _context.Reservations.Find(reservationFilter).ToListAsync(cancellationToken);

        var topCourts = courts.Select(court => 
        {
            var courtReservations = reservations.Where(r => r.CourtId == court.Id).ToList();
            var revenue = courtReservations
                .Where(r => r.Status == ReservationStatus.Confirmed)
                .Sum(r => r.TotalPrice);

            return new TopCourtDto
            {
                Id = court.Id,
                Name = court.Name,
                Revenue = revenue,
                Reservations = courtReservations.Count
            };
        })
        .OrderByDescending(c => c.Revenue)
        .ToList();

        return topCourts;
    }
}
