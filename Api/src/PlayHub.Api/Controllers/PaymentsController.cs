using MediatR;
using Microsoft.AspNetCore.Mvc;
using PlayHub.Application.Features.Payments.Commands.CreatePayment;
using PlayHub.Application.Features.Payments.Commands.DeletePayment;
using PlayHub.Application.Features.Payments.Commands.ProcessPayment;
using PlayHub.Application.Features.Payments.Queries.GetPayments;
using PlayHub.Application.Features.Payments.Queries.GetPaymentById;
using PlayHub.Application.Features.Payments.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authorization;
using PlayHub.Domain.Constants;

namespace PlayHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    [HttpGet]
    public async Task<ActionResult<List<PaymentDto>>> Get([FromQuery] GetPaymentsQuery query)
    {
        return await Mediator.Send(query);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentDto>> GetById(Guid id)
    {
        var result = await Mediator.Send(new GetPaymentByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PaymentDto>> Create(CreatePaymentCommand command)
    {
        var result = await Mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id}/process")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult> Process(Guid id, [FromBody] ProcessPaymentDto request)
    {
        var command = new ProcessPaymentCommand(id, request.TransactionId, request.PaymentDate);
        var result = await Mediator.Send(command);
        if (!result) return NotFound(new { Message = "Payment not found or update failed." });
        return Ok(new { Message = "Payment processed successfully." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.AdminOrManager)]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await Mediator.Send(new DeletePaymentCommand(id));
        if (!result) return NotFound();
        return NoContent();
    }
}

public class ProcessPaymentDto
{
    public string TransactionId { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
}
