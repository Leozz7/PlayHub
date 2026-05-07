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
    
    private List<OperatingDay> _schedules = new();
    public IReadOnlyCollection<OperatingDay> Schedules => _schedules.AsReadOnly();

    public bool IsActive => Status == CourtStatus.Active;


    private List<string> _amenities = new();
    public IReadOnlyCollection<string> Amenities => _amenities.AsReadOnly();

    private List<string> _imageUrls = new();
    public IReadOnlyCollection<string> ImageUrls => _imageUrls.AsReadOnly();

    public byte[]? MainImage { get; private set; }
    private List<byte[]> _images = new();
    public IReadOnlyCollection<byte[]> Images => _images.AsReadOnly();

    public string Address { get; private set; } = string.Empty;
    public string Neighborhood { get; private set; } = string.Empty;
    public string City { get; private set; } = string.Empty;
    public string State { get; private set; } = string.Empty;

    public decimal? OldPrice { get; private set; }
    public string? Badge { get; private set; }
    public double Rating { get; private set; } = 5.0;
    public int ReviewCount { get; private set; } = 0;

    public int OpeningHour { get; private set; } = 6;
    public int ClosingHour { get; private set; } = 23;

    private List<string> _sports = new();
    public IReadOnlyCollection<string> Sports => _sports.AsReadOnly();

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

    public void UpdateLocation(string address, string neighborhood, string city, string state)
    {
        Address = address;
        Neighborhood = neighborhood;
        City = city;
        State = state;
    }

    public void UpdateSchedule(int openingHour, int closingHour)
    {
        OpeningHour = openingHour;
        ClosingHour = closingHour;
    }

    public void UpdateComplexSchedule(IEnumerable<OperatingDay> schedules)
    {
        _schedules = new List<OperatingDay>(schedules);
        
        if (_schedules.Any(s => !s.IsClosed))
        {
            OpeningHour = _schedules.Where(s => !s.IsClosed).Min(s => s.OpeningHour);
            ClosingHour = _schedules.Where(s => !s.IsClosed).Max(s => s.ClosingHour);
        }
    }


    public void UpdateBusinessData(decimal? oldPrice, string? badge, double rating, int reviewCount)
    {
        OldPrice = oldPrice;
        Badge = badge;
        Rating = rating;
        ReviewCount = reviewCount;
    }

    public void ApplyNewReview(int newRating)
    {
        if (newRating < 1 || newRating > 5)
            throw new DomainException("Rating must be between 1 and 5.");

        if (ReviewCount == 0)
        {
            Rating = newRating;
            ReviewCount = 1;
        }
        else
        {
            var total = Rating * ReviewCount + newRating;
            ReviewCount += 1;
            Rating = Math.Round(total / ReviewCount, 2);
        }
    }

    public void UpdateSports(IEnumerable<string> sports)
    {
        _sports = new List<string>(sports);
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

    public void UpdateAmenities(IEnumerable<string> amenities)
    {
        _amenities = new List<string>(amenities);
    }

    public void UpdateImages(IEnumerable<string> imageUrls)
    {
        _imageUrls = new List<string>(imageUrls);
    }

    public void UpdateBinaryImages(byte[]? mainImage, IEnumerable<byte[]> images)
    {
        MainImage = mainImage;
        _images = new List<byte[]>(images);
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

public class OperatingDay
{
    public DayOfWeek Day { get; set; }
    public int OpeningHour { get; set; }
    public int ClosingHour { get; set; }
    public bool IsClosed { get; set; }
}

