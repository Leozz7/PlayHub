using PlayHub.Domain.Common;
using PlayHub.Domain.Enums;
using System.Collections.Generic;

namespace PlayHub.Domain.Entities;

public class Court : BaseEntity
{
    public string Name { get; private set; } = null!;
    public CourtType Type { get; private set; }
    public decimal HourlyRate { get; private set; }
    public CourtStatus Status { get; private set; }
    public int Capacity { get; private set; }
    public string? Description { get; private set; }
    
    public bool IsActive => Status == CourtStatus.Active;

    private List<CourtAmenity> _amenities = new();
    public IReadOnlyCollection<CourtAmenity> Amenities => _amenities.AsReadOnly();

    private List<string> _imageUrls = new();
    public IReadOnlyCollection<string> ImageUrls => _imageUrls.AsReadOnly();

    private Court() { }

    public Court(string name, CourtType type, decimal hourlyRate, int capacity, string? description = null, CourtStatus status = CourtStatus.Active)
    {
        Validate(name, hourlyRate, capacity);

        Name = name;
        Type = type;
        HourlyRate = hourlyRate;
        Capacity = capacity;
        Description = description;
        Status = status;
    }

    private void Validate(string name, decimal hourlyRate, int capacity)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Name is required.");

        if (hourlyRate < 0)
            throw new DomainException("HourlyRate cannot be negative.");

        if (capacity <= 0)
            throw new DomainException("Capacity must be greater than zero.");
    }

    public void UpdateDetails(string name, CourtType type, decimal hourlyRate, int capacity, string? description)
    {
        Validate(name, hourlyRate, capacity);

        Name = name;
        Type = type;
        HourlyRate = hourlyRate;
        Capacity = capacity;
        Description = description;
    }

    public void MarkUnderMaintenance()
    {
        Status = CourtStatus.Maintenance;
    }

    public void RestoreToService()
    {
        Status = CourtStatus.Active;
    }

    public void Deactivate()
    {
        Status = CourtStatus.Inactive;
    }

    public void UpdateAmenities(IEnumerable<CourtAmenity> amenities)
    {
        _amenities = new List<CourtAmenity>(amenities);
    }

    public void UpdateImages(IEnumerable<string> imageUrls)
    {
        _imageUrls = new List<string>(imageUrls);
    }

    public bool CanBeBooked()
    {
        return Status == CourtStatus.Active;
    }

    public decimal CalculateTotalPrice(DateTime start, DateTime end)
    {
        if (start >= end)
            throw new DomainException("Start time must be before end time.");

        var duration = end - start;
        var totalHours = (decimal)duration.TotalHours;
        
        return Math.Round(totalHours * HourlyRate, 2);
    }
}
