using MediatR;

namespace PlayHub.Application.Features.Favorites.Commands.AddFavorite;

/// <summary>Adiciona uma quadra à lista de favoritos do usuário autenticado.</summary>
public record AddFavoriteCommand(Guid UserId, Guid CourtId) : IRequest<bool>;
