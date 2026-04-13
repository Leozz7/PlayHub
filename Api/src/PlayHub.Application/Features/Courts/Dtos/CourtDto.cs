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
    public List<CourtAmenity> Amenities { get; set; } = new();
    public List<string> ImageUrls { get; set; } = new();
    public DateTime Created { get; set; }
}
