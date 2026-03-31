using PlayHub.Domain.Entities;

namespace PlayHub.Application.Common.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
}