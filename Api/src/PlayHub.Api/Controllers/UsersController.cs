using MediatR;
using Microsoft.AspNetCore.Mvc;
using PlayHub.Application.Features.Users.Commands.CreateUser;
using PlayHub.Application.Features.Users.Commands.DeleteUser;
using PlayHub.Application.Features.Users.Commands.UpdateUser;
using PlayHub.Application.Features.Users.Commands.UpdateMyProfile;
using PlayHub.Application.Features.Users.Queries.GetUsers;
using PlayHub.Application.Features.Courts.Queries.GetCourts;
using PlayHub.Application.Features.Users.Dtos;
using Microsoft.AspNetCore.Authorization;
using PlayHub.Domain.Constants;
using PlayHub.Application.Common.Interfaces;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    private readonly ICurrentUserService _currentUserService;

    public UsersController(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

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
        var enhancedCommand = command with { UserId = _currentUserService.UserId };
        var result = await Mediator.Send(enhancedCommand);

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
}
