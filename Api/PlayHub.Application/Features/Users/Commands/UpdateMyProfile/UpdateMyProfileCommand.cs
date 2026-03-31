using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Application.Features.Users.Commands.UpdateMyProfile;

public record UpdateMyProfileCommand(Guid UserId, string Name, string Email) : IRequest<bool>;

public class UpdateMyProfileHandler : IRequestHandler<UpdateMyProfileCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateMyProfileHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<bool> Handle(UpdateMyProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == request.UserId)
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null) return false;

        user.UpdateDetails(request.Name, request.Email, user.Role);

        var result = await _context.Users.ReplaceOneAsync(
            u => u.Id == request.UserId,
            user,
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }
}