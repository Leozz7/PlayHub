using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayHub.Application.Features.SystemLogs.Queries.GetSystemLogsWithPagination;
using PlayHub.Domain.Constants;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.AdminOrManager)]
public class LogsController : ControllerBase
{
    private readonly ISender _mediator;

    public LogsController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<SystemLogDto>>> Get([FromQuery] GetSystemLogsWithPaginationQuery query)
    {
        return await _mediator.Send(query);
    }
}
