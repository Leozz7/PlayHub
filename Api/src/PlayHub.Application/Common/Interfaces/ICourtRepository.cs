using PlayHub.Domain.Entities;
using PlayHub.Application.Features.Courts.Queries.GetCourts;

namespace PlayHub.Application.Common.Interfaces;

public interface ICourtRepository
{
    Task<(List<Court> Items, int TotalCount)> GetPagedCourtsAsync(GetCourtsQuery query, CancellationToken cancellationToken);
    Task<Court?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
}
