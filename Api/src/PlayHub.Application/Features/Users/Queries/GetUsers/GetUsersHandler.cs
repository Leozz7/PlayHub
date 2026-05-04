using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Users.Dtos;
using PlayHub.Application.Features.Courts.Queries.GetCourts;

namespace PlayHub.Application.Features.Users.Queries.GetUsers;

public class GetUsersHandler : IRequestHandler<GetUsersQuery, PagedResult<UserDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public GetUsersHandler(IApplicationDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<PagedResult<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var filter = Builders<Domain.Entities.User>.Filter.Empty;

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            filter &= Builders<Domain.Entities.User>.Filter.Eq(u => u.Role, request.Role);
        }

        if (request.CourtId.HasValue)
        {
            filter &= Builders<Domain.Entities.User>.Filter.AnyEq(u => u.CoutsId, request.CourtId.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchFilter = Builders<Domain.Entities.User>.Filter.Regex(u => u.Name, new MongoDB.Bson.BsonRegularExpression(request.Search, "i"));
            
            if (request.Search.Contains("@"))
            {
                var emailIndex = _encryptionService.CreateBlindIndex(request.Search.Trim().ToLower());
                searchFilter |= Builders<Domain.Entities.User>.Filter.Eq(u => u.EmailIndex, emailIndex);
            }
            
            filter &= searchFilter;
        }

        var totalCount = (int)await _context.Users.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var skip = (request.PageNumber - 1) * request.PageSize;

        var users = await _context.Users
            .Find(filter)
            .Skip(skip)
            .Limit(request.PageSize)
            .SortByDescending(u => u.Created)
            .ToListAsync(cancellationToken);

        var items = users.Select(u => new UserDto
        {
            Id = u.Id,
            Name = u.Name,
            Email = _encryptionService.Decrypt(u.Email),
            Role = u.Role,
            CoutsId = u.CoutsId,
            Created = u.Created
        }).ToList();

        return new PagedResult<UserDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}