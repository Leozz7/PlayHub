using PlayHub.Domain.Enums;

namespace PlayHub.Application.Features.Courts.Dtos;

public class CourtDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public CourtType Type { get; set; }
    public decimal HourlyRate { get; set; }
    public CourtStatus Status { get; set; }
    public int Capacity { get; set; }
    public string? Description { get; set; }
    public List<string> Amenities { get; set; } = new();
    public List<string> ImageUrls { get; set; } = new();
    public DateTime Created { get; set; }

    public string Location { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;

    public string Sport { get; set; } = string.Empty;
    public List<string> Sports { get; set; } = new();

    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public string FrontendStatus { get; set; } = string.Empty; // 'available', 'busy', 'closed'
    public string? Badge { get; set; }
    
    public string Img { get; set; } = string.Empty;

    public bool AvailableToday { get; set; }
    public int OpeningHour { get; set; }
    public int ClosingHour { get; set; }
    public List<string> UnavailableDates { get; set; } = new();

    public List<OperatingDayDto> Schedules { get; set; } = new();

    public string? MainImageBase64 { get; set; }
    public List<string> ImagesBase64 { get; set; } = new();
}

public class OperatingDayDto
{
    public DayOfWeek Day { get; set; }
    public int OpeningHour { get; set; }
    public int ClosingHour { get; set; }
    public bool IsClosed { get; set; }
}

