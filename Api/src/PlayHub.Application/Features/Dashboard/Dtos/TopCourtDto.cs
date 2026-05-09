namespace PlayHub.Application.Features.Dashboard.Dtos;

public class TopCourtDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Reservations { get; set; }
}
