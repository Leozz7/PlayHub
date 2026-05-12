using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;
using PlayHub.Domain.Common.Exceptions;
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
        var existingFilter = Builders<Review>.Filter.And(
            Builders<Review>.Filter.Eq(r => r.CourtId, request.CourtId),
            Builders<Review>.Filter.Eq(r => r.UserId, request.UserId)
        );

        // verificando se o usuário ja avaliou a quadra
        var existing = await _db.Reviews.Find(existingFilter).FirstOrDefaultAsync(cancellationToken);
        if (existing != null)
            throw new ConflictException("Você já avaliou esta quadra.");

        var courtFilter = Builders<Court>.Filter.Eq(c => c.Id, request.CourtId);
        var court = await _db.Courts.Find(courtFilter).FirstOrDefaultAsync(cancellationToken);
        if (court == null)
            throw new NotFoundException(nameof(Court), request.CourtId);

        var review = new Review(request.CourtId, request.UserId, request.UserName, request.Rating, request.Text);
        await _db.Reviews.InsertOneAsync(review, cancellationToken: cancellationToken);

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

    // pegando iniciais do nome
    private static string GetInitials(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "??";
        var parts = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1) return parts[0][..Math.Min(2, parts[0].Length)].ToUpper();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }
}
