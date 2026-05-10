using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Constants;
using System.IdentityModel.Tokens.Jwt;

namespace PlayHub.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId
    {
        get
        {
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                      ?? _httpContextAccessor.HttpContext?.User?.FindFirst("id")?.Value;

            return Guid.TryParse(userId, out var parsedId) ? parsedId : Guid.Empty;
        }
    }

    public string? UserRole => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role) 
                            ?? _httpContextAccessor.HttpContext?.User?.FindFirst("role")?.Value;

    public List<Guid> CourtIds
    {
        get
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("CourtIds");
            if (string.IsNullOrWhiteSpace(claim)) return new List<Guid>();
            
            return claim.Split(',')
                .Select(s => Guid.TryParse(s, out var id) ? id : Guid.Empty)
                .Where(id => id != Guid.Empty)
                .ToList();
        }
    }

    public string? UserName => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name)
                            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(JwtRegisteredClaimNames.Name)
                            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("name");

    public bool IsAdmin => string.Equals(UserRole, AppRoles.Admin, StringComparison.OrdinalIgnoreCase);

    public bool IsManager => string.Equals(UserRole, AppRoles.Manager, StringComparison.OrdinalIgnoreCase);

    public bool IsAuthorizedForCourt(Guid courtId)
    {
        if (IsAdmin) return true;
        if (IsManager)
        {
            return CourtIds.Contains(courtId);
        }
        return false;
    }
}
