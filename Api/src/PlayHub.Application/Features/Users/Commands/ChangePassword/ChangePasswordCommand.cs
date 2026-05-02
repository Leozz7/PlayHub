using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;

namespace PlayHub.Application.Features.Users.Commands.ChangePassword;

public record ChangePasswordCommand(
    Guid UserId, 
    string CurrentPassword, 
    string NewPassword
) : IRequest<bool>;
