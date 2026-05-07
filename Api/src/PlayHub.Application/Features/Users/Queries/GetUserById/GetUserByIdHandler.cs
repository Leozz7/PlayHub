using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Users.Dtos;

namespace PlayHub.Application.Features.Users.Queries.GetUserById;

public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, UserDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public GetUserByIdHandler(IApplicationDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<UserDto?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Find(u => u.Id == request.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return null;

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = _encryptionService.Decrypt(user.Email),
            Phone = !string.IsNullOrWhiteSpace(user.Phone) ? _encryptionService.Decrypt(user.Phone) : null,
            Cpf = !string.IsNullOrWhiteSpace(user.Cpf) ? _encryptionService.Decrypt(user.Cpf) : null,
            Role = user.Role,
            Created = user.Created
        };
    }
}
