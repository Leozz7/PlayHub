using MediatR;
using PlayHub.Application.Features.Courts.Dtos;

namespace PlayHub.Application.Features.Favorites.Queries.GetMyFavorites;

/// <summary>Retorna a lista de quadras favoritas do usuário autenticado.</summary>
public record GetMyFavoritesQuery(Guid UserId) : IRequest<List<CourtDto>>;
