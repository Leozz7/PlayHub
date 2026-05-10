using MediatR;
using MongoDB.Driver;
using MongoDB.Bson;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;

namespace PlayHub.Application.Features.SystemLogs.Queries.GetSystemLogsWithPagination;

public class GetSystemLogsWithPaginationHandler : IRequestHandler<GetSystemLogsWithPaginationQuery, PagedResult<SystemLogDto>>
{
    private readonly IApplicationDbContext _context;

    public GetSystemLogsWithPaginationHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<SystemLogDto>> Handle(GetSystemLogsWithPaginationQuery request, CancellationToken cancellationToken)
    {
        var collection = _context.SystemLogs.Database.GetCollection<BsonDocument>("system_logs");
        var builder = Builders<BsonDocument>.Filter;
        var filter = builder.Empty;

        if (request.Level.HasValue)
        {
            var levelStr = request.Level.Value switch
            {
                Domain.Enums.LogLevel.Info => "Information",
                Domain.Enums.LogLevel.Warning => "Warning",
                Domain.Enums.LogLevel.Error => "Error",
                Domain.Enums.LogLevel.Critical => "Fatal",
                _ => "Information"
            };
            filter &= builder.Eq("Level", levelStr);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            filter &= builder.Regex("RenderedMessage", new MongoDB.Bson.BsonRegularExpression(request.Search, "i")) |
                      builder.Regex("Message", new MongoDB.Bson.BsonRegularExpression(request.Search, "i"));
        }

        var totalCount = await collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);

        var logs = await collection.Find(filter)
            .SortByDescending(x => x["Timestamp"])
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = logs.Select(log =>
        {
            var levelStr = log.Contains("Level") ? log["Level"].ToString() : "Information";
            var level = levelStr switch
            {
                "Verbose" => 1,
                "Debug" => 1,
                "Information" => 1,
                "Warning" => 2,
                "Error" => 3,
                "Fatal" => 4,
                _ => 1
            };

            // extrair UserId, Source e IP do Serilog
            string? userId = null;
            string? userName = null;
            string? source = null;
            string? ipAddress = null;
            if (log.Contains("Properties") && log["Properties"].IsBsonDocument)
            {
                var props = log["Properties"].AsBsonDocument;
                if (props.Contains("UserId")) userId = props["UserId"].ToString();
                if (props.Contains("UserName")) userName = props["UserName"].ToString();
                if (props.Contains("SourceContext")) source = props["SourceContext"].ToString();
                
                // Tenta extrair IP de campos comuns do Serilog
                if (props.Contains("ClientIp")) ipAddress = props["ClientIp"].ToString();
                else if (props.Contains("RemoteIpAddress")) ipAddress = props["RemoteIpAddress"].ToString();
                else if (props.Contains("RequestIp")) ipAddress = props["RequestIp"].ToString();
            }

            // Fallback: tenta no root caso o sink esteja configurado diferente
            if (string.IsNullOrEmpty(ipAddress))
            {
                if (log.Contains("ClientIp")) ipAddress = log["ClientIp"].ToString();
                else if (log.Contains("RemoteIpAddress")) ipAddress = log["RemoteIpAddress"].ToString();
            }

            // Simplificar o Source (pegar apenas o nome da classe)
            if (source != null && source.Contains('.'))
            {
                source = source.Split('.').Last();
            }

            return new SystemLogDto
            {
                Id = Guid.TryParse(log["_id"]?.ToString(), out var gId) ? gId : Guid.NewGuid(),
                Level = (LogLevel)level,
                Message = log.Contains("RenderedMessage") ? log["RenderedMessage"]?.ToString() ?? "No message" : 
                         (log.Contains("Message") ? log["Message"]?.ToString() ?? "No message" : "No message"),
                Exception = log.Contains("Exception") ? log["Exception"]?.ToString() : null,
                Source = source ?? "System",
                IpAddress = ipAddress ?? "N/A",
                UserId = Guid.TryParse(userId, out var uId) ? uId : null,
                UserName = userName,
                CreatedAt = log.Contains("Timestamp") ? log["Timestamp"].ToUniversalTime() : DateTime.UtcNow
            };
        }).ToList();

        return new PagedResult<SystemLogDto>
        {
            Items = items,
            TotalCount = (int)totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}
