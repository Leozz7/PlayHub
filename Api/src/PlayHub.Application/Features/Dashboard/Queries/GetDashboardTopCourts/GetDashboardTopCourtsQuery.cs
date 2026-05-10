using System.Collections.Generic;
using MediatR;
using PlayHub.Application.Features.Dashboard.Dtos;

namespace PlayHub.Application.Features.Dashboard.Queries.GetDashboardTopCourts;

public record GetDashboardTopCourtsQuery : IRequest<List<TopCourtDto>>;
