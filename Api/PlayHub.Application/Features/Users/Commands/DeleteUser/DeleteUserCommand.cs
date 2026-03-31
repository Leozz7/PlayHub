using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Application.Features.Users.Commands.DeleteUser;

public record DeleteUserCommand(Guid Id) : IRequest<bool>;

public class DeleteUserHandler : IRequestHandler<DeleteUserCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteUserHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var result = await _context.Users.DeleteOneAsync(
            u => u.Id == request.Id,
            cancellationToken);

        return result.DeletedCount > 0;
    }
}