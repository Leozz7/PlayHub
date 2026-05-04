using MediatR;

namespace PlayHub.Application.Features.Favorites.Commands.RemoveFavorite;

public record RemoveFavoriteCommand(Guid UserId, Guid CourtId) : IRequest<bool>;
