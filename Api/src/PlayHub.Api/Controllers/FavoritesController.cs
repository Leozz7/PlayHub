using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayHub.Application.Features.Favorites.Commands.AddFavorite;
using PlayHub.Application.Features.Favorites.Commands.RemoveFavorite;
using PlayHub.Application.Features.Favorites.Queries.GetMyFavorites;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly ICurrentUserService _currentUserService;

    public FavoritesController(ISender mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    private Guid CurrentUserId => _currentUserService.UserId;

    [HttpGet]
    public async Task<ActionResult<List<CourtDto>>> GetMyFavorites()
    {
        var result = await _mediator.Send(new GetMyFavoritesQuery(CurrentUserId));
        return Ok(result);
    }

    [HttpPost("{courtId:guid}")]
    public async Task<ActionResult> AddFavorite(Guid courtId)
    {
        var result = await _mediator.Send(new AddFavoriteCommand(CurrentUserId, courtId));

        if (!result) return NotFound("Quadra não encontrada.");

        return NoContent();
    }

    [HttpDelete("{courtId:guid}")]
    public async Task<ActionResult> RemoveFavorite(Guid courtId)
    {
        var result = await _mediator.Send(new RemoveFavoriteCommand(CurrentUserId, courtId));

        if (!result) return NotFound();

        return NoContent();
    }
}
