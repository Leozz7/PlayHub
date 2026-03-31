using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;

namespace PlayHub.Application.Features.Users.Commands.UpdateUser;

public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly PasswordHasher _passwordHasher;

    public UpdateUserHandler(IApplicationDbContext context, PasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<bool> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == request.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (user is null) return false;

        user.UpdateDetails(request.Name, request.Email, request.Role);

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            var newHash = _passwordHasher.Hash(request.Password);
            user.SetNewPasswordHash(newHash);
        }

        var result = await _context.Users.ReplaceOneAsync(
            u => u.Id == request.Id,
            user,
            cancellationToken: cancellationToken);

        return result.ModifiedCount > 0;
    }
}