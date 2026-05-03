using MediatR;
using Microsoft.AspNetCore.Mvc;
using PlayHub.Application.Features.Users.Commands.CreateUser;
using PlayHub.Application.Features.Users.Commands.DeleteUser;
using PlayHub.Application.Features.Users.Commands.UpdateUser;
using PlayHub.Application.Features.Users.Commands.UpdateMyProfile;
using PlayHub.Application.Features.Users.Commands.AddFavorite;
using PlayHub.Application.Features.Users.Commands.RemoveFavorite;
using PlayHub.Application.Features.Users.Queries.GetUsers;
using PlayHub.Application.Features.Users.Queries.GetMyFavorites;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Application.Features.Users.Dtos;
using Microsoft.AspNetCore.Authorization;
using PlayHub.Domain.Constants;
using System.Security.Claims;

using PlayHub.Application.Features.Courts.Queries.GetCourts;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    // Extrai o UserId do JWT (claim "sub" ou "nameid")
    private Guid CurrentUserId =>
        Guid.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"),
            out var id)
        ? id
        : throw new UnauthorizedAccessException("Token inválido: UserId não encontrado.");

    [HttpGet]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult<PagedResult<UserDto>>> Get([FromQuery] GetUsersQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult<UserDto>> Create(CreateUserCommand command)
    {
        var result = await Mediator.Send(command);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult> Update(Guid id, UpdateUserCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID de rota não coincide com o ID do comando.");
        }

        var result = await Mediator.Send(command);

        if (!result) return NotFound();

        return NoContent();
    }

    [HttpPut("my-profile")]
    public async Task<ActionResult> UpdateMyProfile(UpdateMyProfileCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await Mediator.Send(new DeleteUserCommand(id));

        if (!result) return NotFound();

        return NoContent();
    }

    // ──── Favoritos ────────────────────────────────────────────────────────────

    /// <summary>Retorna as quadras favoritas do usuário autenticado.</summary>
    [HttpGet("favorites")]
    public async Task<ActionResult<List<CourtDto>>> GetMyFavorites()
    {
        var result = await Mediator.Send(new GetMyFavoritesQuery(CurrentUserId));
        return Ok(result);
    }

    /// <summary>Adiciona uma quadra aos favoritos do usuário autenticado.</summary>
    [HttpPost("favorites/{courtId:guid}")]
    public async Task<ActionResult> AddFavorite(Guid courtId)
    {
        var result = await Mediator.Send(new AddFavoriteCommand(CurrentUserId, courtId));

        if (!result) return NotFound("Quadra não encontrada.");

        return NoContent();
    }

    /// <summary>Remove uma quadra dos favoritos do usuário autenticado.</summary>
    [HttpDelete("favorites/{courtId:guid}")]
    public async Task<ActionResult> RemoveFavorite(Guid courtId)
    {
        var result = await Mediator.Send(new RemoveFavoriteCommand(CurrentUserId, courtId));

        if (!result) return NotFound();

        return NoContent();
    }
}
