namespace PlayHub.Application.Features.Courts.Dtos;

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid CourtId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserInitials { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
