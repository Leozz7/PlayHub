using MediatR;
using Microsoft.AspNetCore.Mvc;
using PlayHub.Application.Features.Courts.Commands.CreateCourt;
using PlayHub.Application.Features.Courts.Commands.DeleteCourt;
using PlayHub.Application.Features.Courts.Commands.UpdateCourt;
using PlayHub.Application.Features.Courts.Queries.GetCourts;
using PlayHub.Application.Features.Courts.Queries.GetCourtById;
using PlayHub.Application.Features.Courts.Dtos;
using System.Collections.Generic;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourtsController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    [HttpGet]
    public async Task<ActionResult<List<CourtDto>>> Get([FromQuery] GetCourtsQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CourtDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetCourtByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CourtDto>> Create(CreateCourtCommand command)
    {
        var result = await Mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateCourtCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID de rota não coincide com o ID do comando.");
        }

        var result = await Mediator.Send(command);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await Mediator.Send(new DeleteCourtCommand(id));
        if (!result) return NotFound();
        return NoContent();
    }
}
