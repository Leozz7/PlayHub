using MediatR;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PlayHub.Application.Features.Courts.Queries.GetCourts;

public class GetCourtsFiltersHandler : IRequestHandler<GetCourtsFiltersQuery, CourtsFiltersDto>
{
    private readonly IApplicationDbContext _context;

    public GetCourtsFiltersHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CourtsFiltersDto> Handle(GetCourtsFiltersQuery request, CancellationToken cancellationToken)
    {
        var citiesTask = _context.Courts
            .Distinct<string>("city", FilterDefinition<Court>.Empty)
            .ToListAsync(cancellationToken);

        var sportsTask = _context.Courts
            .Distinct<string>("sports", FilterDefinition<Court>.Empty)
            .ToListAsync(cancellationToken);

        await Task.WhenAll(citiesTask, sportsTask);

        return new CourtsFiltersDto
        {
            Cities = citiesTask.Result.Where(c => !string.IsNullOrWhiteSpace(c)).OrderBy(c => c).ToList(),
            Sports = sportsTask.Result.Where(s => !string.IsNullOrWhiteSpace(s)).OrderBy(s => s).ToList()
        };
    }
}
