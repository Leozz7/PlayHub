using System.Collections.Generic;

namespace PlayHub.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }
    string? UserRole { get; }
    List<Guid> CourtIds { get; }
    string? UserName { get; }
    bool IsAdmin { get; }
    bool IsManager { get; }
    bool IsAuthorizedForCourt(Guid courtId);
}
