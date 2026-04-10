using PlayHub.Domain.Common;
using PlayHub.Domain.Enums;

namespace PlayHub.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid ReservationId { get; private set; }
    public Guid UserId { get; private set; }
    public decimal Amount { get; private set; }
    public PaymentStatus Status { get; private set; }
    public PaymentMethod Method { get; private set; }
    public DateTime? PaymentDate { get; private set; }
    public string? TransactionId { get; private set; }

    private Payment() { }

    public Payment(Guid reservationId, Guid userId, decimal amount, PaymentMethod method, PaymentStatus status = PaymentStatus.Pending)
    {
        if (reservationId == Guid.Empty)
            throw new DomainException("ReservationId is required.");

        if (userId == Guid.Empty)
            throw new DomainException("UserId is required.");

        if (amount < 0)
            throw new DomainException("Amount cannot be negative.");

        ReservationId = reservationId;
        UserId = userId;
        Amount = amount;
        Method = method;
        Status = status;
    }

    public void ProcessPayment(string transactionId, DateTime paymentDate)
    {
        if (string.IsNullOrWhiteSpace(transactionId))
            throw new DomainException("TransactionId is required for processing.");

        Status = PaymentStatus.Paid;
        TransactionId = transactionId;
        PaymentDate = paymentDate;
    }

    public void FailPayment(string? transactionId = null)
    {
        Status = PaymentStatus.Failed;
        TransactionId = transactionId;
    }

    public void RefundPayment()
    {
        Status = PaymentStatus.Refunded;
    }
}
