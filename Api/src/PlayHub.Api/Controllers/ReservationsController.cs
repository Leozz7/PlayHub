using MediatR;
using PlayHub.Application.Features.Courts.Queries.GetCourts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using PlayHub.Application.Features.Reservations.Commands.CreateReservation;
using PlayHub.Application.Features.Reservations.Commands.DeleteReservation;
using PlayHub.Application.Features.Reservations.Commands.UpdateReservation;
using PlayHub.Application.Features.Reservations.Queries.GetReservations;
using PlayHub.Application.Features.Reservations.Queries.GetReservationById;
using PlayHub.Application.Features.Reservations.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    [HttpGet]
    public async Task<ActionResult<PagedResult<ReservationDto>>> Get([FromQuery] GetReservationsQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReservationDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetReservationByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create(CreateReservationCommand command)
    {
        var result = await Mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, UpdateReservationCommand command)
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
        var result = await Mediator.Send(new DeleteReservationCommand(id));
        if (!result) return NotFound();
        return NoContent();
    }
}
