using MediatR;

namespace PlayHub.Application.Features.Users.Commands.DeleteMyAccount;

public record DeleteMyAccountCommand(string Password, string ConfirmText) : IRequest<bool>;
