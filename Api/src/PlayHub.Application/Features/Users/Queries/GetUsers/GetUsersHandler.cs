using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Users.Dtos;

namespace PlayHub.Application.Features.Users.Queries.GetUsers;

public class GetUsersHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public GetUsersHandler(IApplicationDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var filter = Builders<Domain.Entities.User>.Filter.Empty;

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            filter = Builders<Domain.Entities.User>.Filter
                .Eq(u => u.Role, request.Role);
        }

        var skip = (request.Page - 1) * request.PageSize;

        var users = await _context.Users
            .Find(filter)
            .Skip(skip)
            .Limit(request.PageSize)
            .SortByDescending(u => u.Created)
            .ToListAsync(cancellationToken);

        return users.Select(u => new UserDto
        {
            Id = u.Id,
            Name = u.Name,
            Email = _encryptionService.Decrypt(u.Email),
            Role = u.Role,
            Created = u.Created
        }).ToList();
    }
}