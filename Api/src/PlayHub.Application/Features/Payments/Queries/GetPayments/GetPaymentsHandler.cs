using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Payments.Dtos;
using PlayHub.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Payments.Queries.GetPayments;

public class GetPaymentsHandler : IRequestHandler<GetPaymentsQuery, List<PaymentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPaymentsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PaymentDto>> Handle(GetPaymentsQuery request, CancellationToken cancellationToken)
    {
        var builder = Builders<Payment>.Filter;
        var filter = builder.Empty;

        if (request.UserId.HasValue)
        {
            filter &= builder.Eq(p => p.UserId, request.UserId.Value);
        }

        if (request.ReservationId.HasValue)
        {
            filter &= builder.Eq(p => p.ReservationId, request.ReservationId.Value);
        }

        var payments = await _context.Payments.Find(filter).ToListAsync(cancellationToken);

        return payments.Select(p => new PaymentDto
        {
            Id = p.Id,
            ReservationId = p.ReservationId,
            UserId = p.UserId,
            Amount = p.Amount,
            Status = p.Status,
            Method = p.Method,
            PaymentDate = p.PaymentDate,
            TransactionId = p.TransactionId,
            Created = p.Created
        }).ToList();
    }
}
