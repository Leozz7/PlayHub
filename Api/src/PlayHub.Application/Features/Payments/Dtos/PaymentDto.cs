using System;
using PlayHub.Domain.Enums;

namespace PlayHub.Application.Features.Payments.Dtos;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid ReservationId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; }
    public PaymentMethod Method { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? TransactionId { get; set; }
    public DateTime Created { get; set; }
}
