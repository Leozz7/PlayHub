using MediatR;
using System.Collections.Generic;

namespace PlayHub.Application.Features.Courts.Queries.GetCourts;

public record GetCourtsFiltersQuery : IRequest<CourtsFiltersDto>;

public class CourtsFiltersDto
{
    public List<string> Cities { get; set; } = new();
    public List<string> Sports { get; set; } = new();
}
