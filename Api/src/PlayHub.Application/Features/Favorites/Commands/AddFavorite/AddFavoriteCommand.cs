using MediatR;

namespace PlayHub.Application.Features.Favorites.Commands.AddFavorite;

public record AddFavoriteCommand(Guid UserId, Guid CourtId) : IRequest<bool>;
