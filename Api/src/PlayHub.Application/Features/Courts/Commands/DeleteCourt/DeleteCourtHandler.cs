using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Application.Features.Courts.Commands.DeleteCourt;

public class DeleteCourtHandler : IRequestHandler<DeleteCourtCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteCourtHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteCourtCommand request, CancellationToken cancellationToken)
    {
        var result = await _context.Courts.DeleteOneAsync(c => c.Id == request.Id, cancellationToken);
        return result.DeletedCount > 0;
    }
}
