using PlayHub.Domain.Common;

namespace PlayHub.Domain.Entities;

public class Review : BaseEntity
{
    public Guid CourtId { get; private set; }
    public Guid UserId { get; private set; }
    public string UserName { get; private set; } = string.Empty;
    public int Rating { get; private set; }
    public string Text { get; private set; } = string.Empty;

    private Review() { }

    public Review(Guid courtId, Guid userId, string userName, int rating, string text)
    {
        if (rating < 1 || rating > 5)
            throw new DomainException("Rating must be between 1 and 5.");

        if (string.IsNullOrWhiteSpace(text))
            throw new DomainException("Review text is required.");

        CourtId = courtId;
        UserId = userId;
        UserName = userName;
        Rating = rating;
        Text = text;
    }
}
