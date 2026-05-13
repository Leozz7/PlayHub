using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MongoDB.Bson;
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
        var isManagerOrAdmin = _currentUserService.IsManager || _currentUserService.IsAdmin;

        if (!isManagerOrAdmin)
            return new List<TopCourtDto>();

        var managerCourtIds = _currentUserService.CourtIds;
        if (managerCourtIds == null || !managerCourtIds.Any())
            return new List<TopCourtDto>();

        // busca apenas os campos necessários das quadras
        var courts = await _context.Courts
            .Find(Builders<Court>.Filter.In(c => c.Id, managerCourtIds))
            .Project(c => new { c.Id, c.Name })
            .ToListAsync(cancellationToken);

        if (courts.Count == 0)
            return new List<TopCourtDto>();

        var courtIds          = courts.Select(c => c.Id).ToList();
        var courtIdBsonArray  = new BsonArray(courtIds.Select(id => BsonValue.Create(id)));
        var confirmedStatus   = (int)ReservationStatus.Confirmed;


        var pipeline = new BsonDocument[]
        {
            
            new("$match", new BsonDocument("courtId", new BsonDocument("$in", courtIdBsonArray))),

            new("$group", new BsonDocument
            {
                { "_id", "$courtId" },
                { "reservations", new BsonDocument("$sum", 1) },
                { "revenue", new BsonDocument("$sum", new BsonDocument
                    {
                        { "$cond", new BsonArray
                            {
                                new BsonDocument("$eq", new BsonArray { "$status", confirmedStatus }),
                                "$totalPrice",
                                0
                            }
                        }
                    })
                }
            }),

            new("$sort",  new BsonDocument("revenue", -1)),
            new("$limit", 5)
        };

        var aggregatedResults = await _context.Reservations
            .Aggregate(PipelineDefinition<Reservation, BsonDocument>.Create(pipeline))
            .ToListAsync(cancellationToken);

        // mapeando o nome da quadra
        var courtNameMap = courts.ToDictionary(c => c.Id, c => c.Name);

        return aggregatedResults
            .Select(doc =>
            {
                var courtId = doc["_id"].AsGuid;
                return new TopCourtDto
                {
                    Id           = courtId,
                    Name         = courtNameMap.TryGetValue(courtId, out var name) ? name : courtId.ToString(),
                    Revenue      = doc["revenue"].ToDecimal(),
                    Reservations = doc["reservations"].ToInt32()
                };
            })
            .ToList();
    }
}
