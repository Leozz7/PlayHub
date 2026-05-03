using MediatR;
using Microsoft.AspNetCore.Mvc;
using PlayHub.Application.Features.Courts.Commands.CreateCourt;
using PlayHub.Application.Features.Courts.Commands.DeleteCourt;
using PlayHub.Application.Features.Courts.Commands.UpdateCourt;
using PlayHub.Application.Features.Courts.Queries.GetCourts;
using PlayHub.Application.Features.Courts.Queries.GetCourtById;
using PlayHub.Application.Features.Courts.Queries.GetCourtAvailability;
using PlayHub.Application.Features.Courts.Dtos;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using PlayHub.Domain.Constants;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CourtsController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    private Guid GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) 
                  ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
                  ?? User.FindFirstValue("id");
        return Guid.TryParse(userId, out var parsedId) ? parsedId : Guid.Empty;
    }

    private List<Guid> GetCourtIdsFromClaims()
    {
        var claim = User.FindFirstValue("CourtIds");
        if (string.IsNullOrWhiteSpace(claim)) return new List<Guid>();
        return claim.Split(',').Select(Guid.Parse).ToList();
    }

    private bool IsManagerNotAuthorizedForCourt(Guid courtId)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role == AppRoles.Manager)
        {
            var allowedCourts = GetCourtIdsFromClaims();
            return !allowedCourts.Contains(courtId);
        }
        return false;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourtDto>>> Get([FromQuery] GetCourtsQuery query)
    {
        var enhancedQuery = query with 
        { 
            CurrentUserRole = User.FindFirstValue(ClaimTypes.Role),
            UserCourtIds = GetCourtIdsFromClaims() 
        };
        return await Mediator.Send(enhancedQuery);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CourtDto>> GetById(Guid id)
    {
        if (IsManagerNotAuthorizedForCourt(id)) return Forbid();

        var result = await Mediator.Send(new GetCourtByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult<CourtDto>> Create(CreateCourtCommand command)
    {
        var enhancedCommand = command with 
        { 
            CurrentUserId = GetCurrentUserId(),
            CurrentUserRole = User.FindFirstValue(ClaimTypes.Role) 
        };
        var result = await Mediator.Send(enhancedCommand);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult> Update(Guid id, UpdateCourtCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID de rota não coincide com o ID do comando.");
        }

        if (IsManagerNotAuthorizedForCourt(id)) return Forbid();

        var result = await Mediator.Send(command);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult> Delete(Guid id)
    {
        if (IsManagerNotAuthorizedForCourt(id)) return Forbid();

        var result = await Mediator.Send(new DeleteCourtCommand(id));
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("{id}/availability")]
    public async Task<ActionResult<CourtAvailabilityDto>> GetAvailability(Guid id, [FromQuery] DateTime date)
    {
        if (IsManagerNotAuthorizedForCourt(id)) return Forbid();

        var query = new GetCourtAvailabilityQuery(id, date);
        return await Mediator.Send(query);
    }
}
