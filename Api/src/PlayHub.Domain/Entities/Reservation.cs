using PlayHub.Domain.Common;
using PlayHub.Domain.Enums;

namespace PlayHub.Domain.Entities;

public class Reservation : BaseEntity
{
    public Guid CourtId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public ReservationStatus Status { get; private set; }
    public decimal TotalPrice { get; private set; }
    public Guid? PaymentId { get; private set; }

    private Reservation() { }

    public Reservation(Guid courtId, Guid userId, DateTime startTime, DateTime endTime, decimal totalPrice, ReservationStatus status = ReservationStatus.Pending)
    {
        if (courtId == Guid.Empty)
            throw new DomainException("CourtId is required.");

        if (userId == Guid.Empty)
            throw new DomainException("UserId is required.");

        if (startTime >= endTime)
            throw new DomainException("StartTime must be before EndTime.");

        if (totalPrice < 0)
            throw new DomainException("TotalPrice cannot be negative.");

        CourtId = courtId;
        UserId = userId;
        StartTime = startTime;
        EndTime = endTime;
        TotalPrice = totalPrice;
        Status = status;
    }

    public void UpdateStatus(ReservationStatus status)
    {
        Status = status;
    }

    public void SetPaymentId(Guid paymentId)
    {
        if (paymentId == Guid.Empty)
            throw new DomainException("PaymentId is required.");

        PaymentId = paymentId;
    }
}
