using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Dashboard.Dtos;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;

namespace PlayHub.Application.Features.Dashboard.Queries.GetDashboardStats;

public class GetDashboardStatsHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetDashboardStatsHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var managerId = _currentUserService.UserId;
        var isManagerOrAdmin = _currentUserService.IsManager || _currentUserService.IsAdmin;

        if (!isManagerOrAdmin)
        {
            return new DashboardStatsDto();
        }

        var managerCourtIds = _currentUserService.CourtIds;
        if (managerCourtIds == null || !managerCourtIds.Any())
        {
            return new DashboardStatsDto();
        }

        var courtFilter = Builders<Court>.Filter.In(c => c.Id, managerCourtIds);
        var courts = await _context.Courts.Find(courtFilter).ToListAsync(cancellationToken);
        var courtIds = courts.Select(c => c.Id).ToList();

        var currentMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var nextMonthStart = currentMonthStart.AddMonths(1);

        var reservationFilter = Builders<Reservation>.Filter.In(r => r.CourtId, courtIds);
        var allReservationsForManager = await _context.Reservations.Find(reservationFilter).ToListAsync(cancellationToken);

        var currentMonthReservations = allReservationsForManager
            .Where(r => r.StartTime >= currentMonthStart && r.StartTime < nextMonthStart)
            .ToList();

        var uniqueClients = allReservationsForManager
            .Select(r => r.UserId)
            .Distinct()
            .Count();

        var monthlyRevenue = currentMonthReservations
            .Where(r => r.Status == ReservationStatus.Confirmed)
            .Sum(r => r.TotalPrice);

        return new DashboardStatsDto
        {
            ManagedCourts = courtIds.Count,
            ReservationsMonth = currentMonthReservations.Count,
            UniqueClients = uniqueClients,
            MonthlyRevenue = monthlyRevenue
        };
    }
}
