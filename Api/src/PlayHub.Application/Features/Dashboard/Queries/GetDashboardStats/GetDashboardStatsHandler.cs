using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
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
        var isManagerOrAdmin = _currentUserService.IsManager || _currentUserService.IsAdmin;

        if (!isManagerOrAdmin)
            return new DashboardStatsDto();

        var managerCourtIds = _currentUserService.CourtIds;
        if (managerCourtIds == null || !managerCourtIds.Any())
            return new DashboardStatsDto();

        // busca apenas os ids das quadras gerenciadas
        var courtIds = await _context.Courts
            .Find(Builders<Court>.Filter.In(c => c.Id, managerCourtIds))
            .Project(c => c.Id)
            .ToListAsync(cancellationToken);

        if (courtIds.Count == 0)
            return new DashboardStatsDto();

        var currentMonthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var nextMonthStart    = currentMonthStart.AddMonths(1);
        var confirmedStatus   = (int)ReservationStatus.Confirmed;

        var courtIdBsonArray = new BsonArray(courtIds.Select(id => BsonValue.Create(id)));

        var pipeline = new BsonDocument[]
        {
            // quadras do manager
            new("$match", new BsonDocument("courtId", new BsonDocument("$in", courtIdBsonArray))),

            new("$facet", new BsonDocument
            {
                {
                    "monthStats", new BsonArray
                    {
                        new BsonDocument("$match", new BsonDocument
                        {
                            { "startTime", new BsonDocument
                                {
                                    { "$gte", currentMonthStart },
                                    { "$lt",  nextMonthStart    }
                                }
                            }
                        }),
                        new BsonDocument("$group", new BsonDocument
                        {
                            { "_id", BsonNull.Value },
                            { "count", new BsonDocument("$sum", 1) },
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
                        })
                    }
                },
                {
                    "clientStats", new BsonArray
                    {
                        new BsonDocument("$group", new BsonDocument("_id", "$userId")),
                        new BsonDocument("$count", "total")
                    }
                }
            })
        };

        var facetDoc = await _context.Reservations
            .Aggregate(PipelineDefinition<Reservation, BsonDocument>.Create(pipeline))
            .SingleOrDefaultAsync(cancellationToken);

        int  reservationsMonth = 0;
        decimal monthlyRevenue = 0m;
        int  uniqueClients     = 0;

        if (facetDoc is not null)
        {
            var monthStats = facetDoc["monthStats"].AsBsonArray.FirstOrDefault()?.AsBsonDocument;
            if (monthStats is not null)
            {
                reservationsMonth = monthStats["count"].ToInt32();
                monthlyRevenue    = (decimal)monthStats["revenue"].ToDouble();
            }

            var clientStats = facetDoc["clientStats"].AsBsonArray.FirstOrDefault()?.AsBsonDocument;
            if (clientStats is not null)
                uniqueClients = clientStats["total"].ToInt32();
        }

        return new DashboardStatsDto
        {
            ManagedCourts     = courtIds.Count,
            ReservationsMonth = reservationsMonth,
            UniqueClients     = uniqueClients,
            MonthlyRevenue    = monthlyRevenue
        };
    }
}
