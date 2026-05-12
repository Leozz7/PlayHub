using MediatR;
using PlayHub.Application.Features.Courts.Dtos;

namespace PlayHub.Application.Features.Favorites.Queries.GetMyFavorites;
public record GetMyFavoritesQuery(Guid UserId) : IRequest<List<CourtDto>>;
