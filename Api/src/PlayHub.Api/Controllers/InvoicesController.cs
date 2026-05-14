using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using PlayHub.Application.Features.Invoices.Dtos;
using PlayHub.Application.Features.Invoices.Queries.GetInvoices;
using PlayHub.Domain.Constants;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.AdminOrManager)]
public class InvoicesController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    [HttpGet]
    public async Task<ActionResult<List<InvoiceDto>>> Get(
        [FromQuery] Guid? recurringGroupId,
        [FromQuery] Guid? userId,
        [FromQuery] int? month,
        [FromQuery] int? year)
    {
        var result = await Mediator.Send(new GetInvoicesQuery(recurringGroupId, userId, month, year));
        return Ok(result);
    }
}
