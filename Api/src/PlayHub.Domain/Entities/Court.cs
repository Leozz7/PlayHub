using PlayHub.Domain.Common;
using PlayHub.Domain.Enums;

namespace PlayHub.Domain.Entities;

public class Court : BaseEntity
{
    public string Name { get; private set; } = null!;
    public CourtType Type { get; private set; }
    public decimal HourlyRate { get; private set; }
    public bool IsActive { get; private set; }
    public int Capacity { get; private set; }
    public string? Description { get; private set; }

    private Court() { }

    public Court(string name, CourtType type, decimal hourlyRate, int capacity, string? description = null, bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Name is required.");

        if (hourlyRate < 0)
            throw new DomainException("HourlyRate cannot be negative.");

        if (capacity <= 0)
            throw new DomainException("Capacity must be greater than zero.");

        Name = name;
        Type = type;
        HourlyRate = hourlyRate;
        Capacity = capacity;
        Description = description;
        IsActive = isActive;
    }

    public void UpdateDetails(string name, CourtType type, decimal hourlyRate, int capacity, string? description)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Name is required.");

        if (hourlyRate < 0)
            throw new DomainException("HourlyRate cannot be negative.");

        if (capacity <= 0)
            throw new DomainException("Capacity must be greater than zero.");

        Name = name;
        Type = type;
        HourlyRate = hourlyRate;
        Capacity = capacity;
        Description = description;
    }

    public void SetActiveStatus(bool isActive)
    {
        IsActive = isActive;
    }
}
