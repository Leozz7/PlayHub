using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Payments.Dtos;
using PlayHub.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Payments.Queries.GetPaymentById;

public class GetPaymentByIdHandler : IRequestHandler<GetPaymentByIdQuery, PaymentDto?>
{
    private readonly IApplicationDbContext _context;

    public GetPaymentByIdHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentDto?> Handle(GetPaymentByIdQuery request, CancellationToken cancellationToken)
    {
        var filter = Builders<Payment>.Filter.Eq(p => p.Id, request.Id);
        var payment = await _context.Payments.Find(filter).FirstOrDefaultAsync(cancellationToken);

        if (payment == null)
            return null;

        return new PaymentDto
        {
            Id = payment.Id,
            ReservationId = payment.ReservationId,
            UserId = payment.UserId,
            Amount = payment.Amount,
            Status = payment.Status,
            Method = payment.Method,
            PaymentDate = payment.PaymentDate,
            TransactionId = payment.TransactionId,
            Created = payment.Created
        };
    }
}
