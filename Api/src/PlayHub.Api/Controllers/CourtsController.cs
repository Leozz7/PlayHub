using MediatR;
using Microsoft.AspNetCore.Mvc;
using PlayHub.Application.Features.Courts.Commands.CreateCourt;
using PlayHub.Application.Features.Courts.Commands.DeleteCourt;
using PlayHub.Application.Features.Courts.Commands.UpdateCourt;
using PlayHub.Application.Features.Courts.Commands.SubmitReview;
using PlayHub.Application.Features.Courts.Queries.GetCourts;
using PlayHub.Application.Features.Courts.Queries.GetCourtById;
using PlayHub.Application.Features.Courts.Queries.GetCourtAvailability;
using PlayHub.Application.Features.Courts.Queries.GetCourtReviews;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using PlayHub.Domain.Constants;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CourtsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CourtsController> _logger;

    public CourtsController(IMediator mediator, ICurrentUserService currentUserService, ILogger<CourtsController> logger)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<CourtDto>>> Get([FromQuery] GetCourtsQuery query)
    {
        return await _mediator.Send(query);
    }

    [HttpGet("filters")]
    [AllowAnonymous]
    public async Task<ActionResult<CourtsFiltersDto>> GetFilters()
    {
        return await _mediator.Send(new GetCourtsFiltersQuery());
    }

    [HttpGet("management")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult<PagedResult<CourtDto>>> GetManagement([FromQuery] GetCourtsQuery query)
    {
        var enhancedQuery = query with 
        { 
            CurrentUserId = _currentUserService.UserId,
            CurrentUserRole = _currentUserService.UserRole,
            UserCourtIds = _currentUserService.CourtIds 
        };

        return await _mediator.Send(enhancedQuery);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<CourtDto>> GetById(Guid id)
    {
        _logger.LogInformation("Receiving GetById request for court {CourtId}. User: {UserId}, Anonymous: {IsAnonymous}", 
            id, _currentUserService.UserId, _currentUserService.UserId == Guid.Empty);

        var result = await _mediator.Send(new GetCourtByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult<CourtDto>> Create([FromBody] CreateCourtCommand command)
    {
        var enhancedCommand = command with 
        { 
            CurrentUserId = _currentUserService.UserId,
            CurrentUserRole = _currentUserService.UserRole 
        };
        var result = await _mediator.Send(enhancedCommand);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult> Update(Guid id, [FromBody] UpdateCourtCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID de rota não coincide com o ID do comando.");
        }

        if (!_currentUserService.IsAuthorizedForCourt(id)) return Forbid();

        var result = await _mediator.Send(command);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult> Delete(Guid id)
    {
        if (!_currentUserService.IsAuthorizedForCourt(id)) return Forbid();

        var result = await _mediator.Send(new DeleteCourtCommand(id));
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("{id}/availability")]
    [AllowAnonymous]
    public async Task<ActionResult<CourtAvailabilityDto>> GetAvailability(Guid id, [FromQuery] DateTime date)
    {
        var query = new GetCourtAvailabilityQuery(id, date);
        return await _mediator.Send(query);
    }

    [HttpGet("{id}/reviews")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ReviewDto>>> GetReviews(Guid id)
    {
        var result = await _mediator.Send(new GetCourtReviewsQuery(id));
        return Ok(result);
    }

    [HttpPost("{id}/reviews")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> SubmitReview(Guid id, [FromBody] SubmitReviewRequest body)
    {
        var userId = _currentUserService.UserId;
        if (userId == Guid.Empty) return Unauthorized();

        var userName = _currentUserService.UserName ?? "Usuário";
        var command = new SubmitReviewCommand(id, userId, userName, body.Rating, body.Text);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetReviews), new { id }, result);
    }
}

public record SubmitReviewRequest(int Rating, string Text);
