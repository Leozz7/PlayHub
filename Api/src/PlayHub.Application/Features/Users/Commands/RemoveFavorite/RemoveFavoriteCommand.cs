using MediatR;

namespace PlayHub.Application.Features.Users.Commands.RemoveFavorite;

/// <summary>Remove uma quadra da lista de favoritos do usuário autenticado.</summary>
public record RemoveFavoriteCommand(Guid UserId, Guid CourtId) : IRequest<bool>;
