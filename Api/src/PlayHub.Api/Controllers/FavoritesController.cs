using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayHub.Application.Features.Favorites.Commands.AddFavorite;
using PlayHub.Application.Features.Favorites.Commands.RemoveFavorite;
using PlayHub.Application.Features.Favorites.Queries.GetMyFavorites;
using PlayHub.Application.Features.Courts.Dtos;
using System.Security.Claims;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly ISender _mediator;

    public FavoritesController(ISender mediator)
    {
        _mediator = mediator;
    }

    private Guid CurrentUserId =>
        Guid.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"),
            out var id)
        ? id
        : throw new UnauthorizedAccessException("Token inválido: UserId não encontrado.");

    /// <summary>Retorna as quadras favoritas do usuário autenticado.</summary>
    [HttpGet]
    public async Task<ActionResult<List<CourtDto>>> GetMyFavorites()
    {
        var result = await _mediator.Send(new GetMyFavoritesQuery(CurrentUserId));
        return Ok(result);
    }

    /// <summary>Adiciona uma quadra aos favoritos do usuário autenticado.</summary>
    [HttpPost("{courtId:guid}")]
    public async Task<ActionResult> AddFavorite(Guid courtId)
    {
        var result = await _mediator.Send(new AddFavoriteCommand(CurrentUserId, courtId));

        if (!result) return NotFound("Quadra não encontrada.");

        return NoContent();
    }

    /// <summary>Remove uma quadra dos favoritos do usuário autenticado.</summary>
    [HttpDelete("{courtId:guid}")]
    public async Task<ActionResult> RemoveFavorite(Guid courtId)
    {
        var result = await _mediator.Send(new RemoveFavoriteCommand(CurrentUserId, courtId));

        if (!result) return NotFound();

        return NoContent();
    }
}
