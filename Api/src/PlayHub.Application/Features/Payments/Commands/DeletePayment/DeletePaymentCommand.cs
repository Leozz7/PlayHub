using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Payments.Commands.DeletePayment;

public record DeletePaymentCommand(Guid Id) : IRequest<bool>;

public class DeletePaymentHandler : IRequestHandler<DeletePaymentCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeletePaymentHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeletePaymentCommand request, CancellationToken cancellationToken)
    {
        var filter = Builders<Payment>.Filter.Eq(p => p.Id, request.Id);
        var result = await _context.Payments.DeleteOneAsync(filter, cancellationToken);

        return result.DeletedCount > 0;
    }
}
