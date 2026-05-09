using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using PlayHub.Application.Features.Dashboard.Dtos;
using PlayHub.Application.Features.Dashboard.Queries.GetDashboardStats;
using PlayHub.Application.Features.Dashboard.Queries.GetDashboardTopCourts;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        return await Mediator.Send(new GetDashboardStatsQuery());
    }

    [HttpGet("top-courts")]
    public async Task<ActionResult<List<TopCourtDto>>> GetTopCourts()
    {
        return await Mediator.Send(new GetDashboardTopCourtsQuery());
    }
}
