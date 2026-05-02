using MediatR;
using PlayHub.Application.Features.Courts.Dtos;

namespace PlayHub.Application.Features.Users.Queries.GetMyFavorites;

/// <summary>
/// Retorna os detalhes completos de todas as quadras favoritas do usuário autenticado.
/// </summary>
public record GetMyFavoritesQuery(Guid UserId) : IRequest<List<CourtDto>>;
