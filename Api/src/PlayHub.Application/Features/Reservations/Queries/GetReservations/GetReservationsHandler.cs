using MediatR;
using PlayHub.Application.Features.Courts.Queries.GetCourts;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Reservations.Dtos;
using PlayHub.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Reservations.Queries.GetReservations;

public class GetReservationsHandler : IRequestHandler<GetReservationsQuery, PagedResult<ReservationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetReservationsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ReservationDto>> Handle(GetReservationsQuery request, CancellationToken cancellationToken)
    {
        var filterBuilder = Builders<Domain.Entities.Reservation>.Filter;
        var filter = filterBuilder.Empty;

        if (request.CourtId.HasValue)
        {
            filter &= filterBuilder.Eq(r => r.CourtId, request.CourtId.Value);
        }

        if (request.UserId.HasValue)
        {
            filter &= filterBuilder.Eq(r => r.UserId, request.UserId.Value);
        }

        if (request.Status.HasValue)
        {
            filter &= filterBuilder.Eq(r => r.Status, request.Status.Value);
        }

        var totalCount = (int)await _context.Reservations.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var reservations = await _context.Reservations
            .Find(filter)
            .SortByDescending(r => r.StartTime)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync(cancellationToken);

        var courtIds = reservations.Select(r => r.CourtId).Distinct().ToList();
        var userIds = reservations.Select(r => r.UserId).Distinct().ToList();

        var courts = await _context.Courts.Find(c => courtIds.Contains(c.Id)).ToListAsync(cancellationToken);
        var users = await _context.Users.Find(u => userIds.Contains(u.Id)).ToListAsync(cancellationToken);

        var items = reservations.Select(reservation => new ReservationDto
        {
            Id = reservation.Id,
            CourtId = reservation.CourtId,
            CourtName = courts.FirstOrDefault(c => c.Id == reservation.CourtId)?.Name,
            UserId = reservation.UserId,
            UserName = users.FirstOrDefault(u => u.Id == reservation.UserId)?.Name,
            StartTime = reservation.StartTime,
            EndTime = reservation.EndTime,
            Status = reservation.Status,
            TotalPrice = reservation.TotalPrice,
            PaymentId = reservation.PaymentId,
            Created = reservation.Created
        }).ToList();

        return new PagedResult<ReservationDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}
