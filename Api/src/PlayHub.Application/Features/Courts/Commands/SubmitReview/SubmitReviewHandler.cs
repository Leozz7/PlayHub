using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Entities;

namespace PlayHub.Application.Features.Courts.Commands.SubmitReview;

public record SubmitReviewCommand(
    Guid CourtId,
    Guid UserId,
    string UserName,
    int Rating,
    string Text
) : IRequest<ReviewDto>;

public class SubmitReviewHandler : IRequestHandler<SubmitReviewCommand, ReviewDto>
{
    private readonly IApplicationDbContext _db;

    public SubmitReviewHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<ReviewDto> Handle(SubmitReviewCommand request, CancellationToken cancellationToken)
    {
        // Check if user already reviewed this court
        var existingFilter = Builders<Review>.Filter.And(
            Builders<Review>.Filter.Eq(r => r.CourtId, request.CourtId),
            Builders<Review>.Filter.Eq(r => r.UserId, request.UserId)
        );

        var existing = await _db.Reviews.Find(existingFilter).FirstOrDefaultAsync(cancellationToken);
        if (existing != null)
            throw new InvalidOperationException("Você já avaliou esta quadra.");

        // Load the court to update its aggregate rating
        var courtFilter = Builders<Court>.Filter.Eq(c => c.Id, request.CourtId);
        var court = await _db.Courts.Find(courtFilter).FirstOrDefaultAsync(cancellationToken);
        if (court == null)
            throw new InvalidOperationException("Quadra não encontrada.");

        // Create review
        var review = new Review(request.CourtId, request.UserId, request.UserName, request.Rating, request.Text);
        await _db.Reviews.InsertOneAsync(review, cancellationToken: cancellationToken);

        // Update court's aggregated rating (incremental average)
        court.ApplyNewReview(request.Rating);

        var courtUpdate = Builders<Court>.Update
            .Set(c => c.Rating, court.Rating)
            .Set(c => c.ReviewCount, court.ReviewCount);

        await _db.Courts.UpdateOneAsync(courtFilter, courtUpdate, cancellationToken: cancellationToken);

        return new ReviewDto
        {
            Id = review.Id,
            CourtId = review.CourtId,
            UserId = review.UserId,
            UserName = review.UserName,
            UserInitials = GetInitials(review.UserName),
            Rating = review.Rating,
            Text = review.Text,
            CreatedAt = review.Created,
        };
    }

    private static string GetInitials(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "??";
        var parts = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1) return parts[0][..Math.Min(2, parts[0].Length)].ToUpper();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }
}
