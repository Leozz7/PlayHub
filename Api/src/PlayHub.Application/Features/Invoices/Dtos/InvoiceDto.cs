using PlayHub.Domain.Enums;

namespace PlayHub.Application.Features.Invoices.Dtos;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public Guid RecurringGroupId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal TotalAmount { get; set; }
    public InvoiceStatus Status { get; set; }
    public List<Guid> ReservationIds { get; set; } = [];
    public DateTime Created { get; set; }
}
