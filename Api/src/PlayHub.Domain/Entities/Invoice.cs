using PlayHub.Domain.Common;
using PlayHub.Domain.Enums;

namespace PlayHub.Domain.Entities;

public class Invoice : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid RecurringGroupId { get; private set; }
    public int Month { get; private set; }
    public int Year { get; private set; }
    public decimal TotalAmount { get; private set; }
    public InvoiceStatus Status { get; private set; }

    private readonly List<Guid> _reservationIds = new();
    public IReadOnlyList<Guid> ReservationIds => _reservationIds.AsReadOnly();

    private Invoice() { }

    public Invoice(
        Guid userId,
        Guid recurringGroupId,
        int month,
        int year,
        decimal totalAmount,
        IEnumerable<Guid> reservationIds)
    {
        if (userId == Guid.Empty)
            throw new DomainException("UserId is required.");

        if (recurringGroupId == Guid.Empty)
            throw new DomainException("RecurringGroupId is required.");

        if (month < 1 || month > 12)
            throw new DomainException("Month must be between 1 and 12.");

        if (year < 2000)
            throw new DomainException("Year is invalid.");

        if (totalAmount < 0)
            throw new DomainException("TotalAmount cannot be negative.");

        UserId = userId;
        RecurringGroupId = recurringGroupId;
        Month = month;
        Year = year;
        TotalAmount = totalAmount;
        Status = InvoiceStatus.Pending;
        _reservationIds.AddRange(reservationIds);
    }

    public void MarkAsPaid()
    {
        if (Status == InvoiceStatus.Paid)
            throw new DomainException("Invoice is already paid.");

        Status = InvoiceStatus.Paid;
    }

    public void MarkAsOverdue()
    {
        if (Status == InvoiceStatus.Paid)
            throw new DomainException("Cannot mark a paid invoice as overdue.");

        Status = InvoiceStatus.Overdue;
    }
}
