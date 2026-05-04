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
    private readonly IEncryptionService _encryptionService;

    public GetPaymentsHandler(IApplicationDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
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
        
        var userIds = payments.Select(p => p.UserId).Distinct().ToList();
        var users = await _context.Users
            .Find(Builders<User>.Filter.In(u => u.Id, userIds))
            .ToListAsync(cancellationToken);

        return payments.Select(p => {
            var user = users.FirstOrDefault(u => u.Id == p.UserId);
            return new PaymentDto
            {
                Id = p.Id,
                ReservationId = p.ReservationId,
                UserId = p.UserId,
                UserEmail = user != null ? _encryptionService.Decrypt(user.Email) : "Usuário não encontrado",
                UserName = user?.Name ?? "N/A",
                Amount = p.Amount,
                Status = p.Status,
                Method = p.Method,
                PaymentDate = p.PaymentDate,
                TransactionId = p.TransactionId,
                Created = p.Created
            };
        }).ToList();
    }
}
