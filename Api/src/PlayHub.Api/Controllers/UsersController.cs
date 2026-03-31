using MediatR;
using Microsoft.AspNetCore.Mvc;
using PlayHub.Application.Features.Users.Commands.CreateUser;
using PlayHub.Application.Features.Users.Commands.DeleteUser;
using PlayHub.Application.Features.Users.Commands.UpdateUser;
using PlayHub.Application.Features.Users.Commands.UpdateMyProfile;
using PlayHub.Application.Features.Users.Queries.GetUsers;
using PlayHub.Application.Features.Users.Dtos;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();
    
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<List<UserDto>>> Get([FromQuery] GetUsersQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserDto>> Create(CreateUserCommand command)
    {
        var result = await Mediator.Send(command);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateMyProfile(UpdateMyProfileCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await Mediator.Send(new DeleteUserCommand(id));

        if (!result) return NotFound();

        return NoContent();
    }
}
