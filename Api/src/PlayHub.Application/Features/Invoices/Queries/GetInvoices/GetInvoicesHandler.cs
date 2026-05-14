using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Invoices.Dtos;
using PlayHub.Domain.Entities;

namespace PlayHub.Application.Features.Invoices.Queries.GetInvoices;

public record GetInvoicesQuery(
    Guid? RecurringGroupId = null,
    Guid? UserId = null,
    int? Month = null,
    int? Year = null
) : IRequest<List<InvoiceDto>>;

public class GetInvoicesHandler : IRequestHandler<GetInvoicesQuery, List<InvoiceDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public GetInvoicesHandler(IApplicationDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<List<InvoiceDto>> Handle(GetInvoicesQuery request, CancellationToken cancellationToken)
    {
        var filter = Builders<Invoice>.Filter.Empty;

        if (request.RecurringGroupId.HasValue)
            filter &= Builders<Invoice>.Filter.Eq(i => i.RecurringGroupId, request.RecurringGroupId.Value);

        if (request.UserId.HasValue)
            filter &= Builders<Invoice>.Filter.Eq(i => i.UserId, request.UserId.Value);

        if (request.Month.HasValue)
            filter &= Builders<Invoice>.Filter.Eq(i => i.Month, request.Month.Value);

        if (request.Year.HasValue)
            filter &= Builders<Invoice>.Filter.Eq(i => i.Year, request.Year.Value);

        var invoices = await _context.Invoices
            .Find(filter)
            .SortByDescending(i => i.Year)
            .ThenByDescending(i => i.Month)
            .ToListAsync(cancellationToken);

        var userIds = invoices.Select(i => i.UserId).Distinct().ToList();
        var users = await _context.Users
            .Find(u => userIds.Contains(u.Id))
            .ToListAsync(cancellationToken);

        var userMap = users.ToDictionary(u => u.Id, u => u);

        return invoices.Select(i =>
        {
            userMap.TryGetValue(i.UserId, out var user);
            return new InvoiceDto
            {
                Id               = i.Id,
                UserId           = i.UserId,
                UserName         = user?.Name,
                UserEmail        = user?.Email is not null ? _encryptionService.Decrypt(user.Email) : null,
                RecurringGroupId = i.RecurringGroupId,
                Month            = i.Month,
                Year             = i.Year,
                TotalAmount      = i.TotalAmount,
                Status           = i.Status,
                ReservationIds   = i.ReservationIds.ToList(),
                Created          = i.Created
            };
        }).ToList();
    }
}
