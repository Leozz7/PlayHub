using MediatR;
using PlayHub.Application.Features.Dashboard.Dtos;

namespace PlayHub.Application.Features.Dashboard.Queries.GetDashboardStats;

public record GetDashboardStatsQuery : IRequest<DashboardStatsDto>;
