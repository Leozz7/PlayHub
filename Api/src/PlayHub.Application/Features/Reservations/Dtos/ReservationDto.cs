using PlayHub.Domain.Enums;
using System;

namespace PlayHub.Application.Features.Reservations.Dtos;

public class ReservationDto
{
    public Guid Id { get; set; }
    public Guid CourtId { get; set; }
    public string? CourtName { get; set; }
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public ReservationStatus Status { get; set; }
    public decimal TotalPrice { get; set; }
    public Guid? PaymentId { get; set; }
    public DateTime Created { get; set; }
}
