using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Features.Courts.Dtos;

namespace PlayHub.Application.Features.Courts.Queries.GetCourtReviews;

public record GetCourtReviewsQuery(Guid CourtId) : IRequest<List<ReviewDto>>;

public class GetCourtReviewsHandler : IRequestHandler<GetCourtReviewsQuery, List<ReviewDto>>
{
    private readonly IApplicationDbContext _db;

    public GetCourtReviewsHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<ReviewDto>> Handle(GetCourtReviewsQuery request, CancellationToken cancellationToken)
    {
        var filter = Builders<Domain.Entities.Review>.Filter.Eq(r => r.CourtId, request.CourtId);
        var sort = Builders<Domain.Entities.Review>.Sort.Descending(r => r.Created);

        var reviews = await _db.Reviews
            .Find(filter)
            .Sort(sort)
            .ToListAsync(cancellationToken);

        return reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            CourtId = r.CourtId,
            UserId = r.UserId,
            UserName = r.UserName,
            UserInitials = GetInitials(r.UserName),
            Rating = r.Rating,
            Text = r.Text,
            CreatedAt = r.Created,
        }).ToList();
    }

    private static string GetInitials(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "??";
        var parts = name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 1) return parts[0][..Math.Min(2, parts[0].Length)].ToUpper();
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }
}
