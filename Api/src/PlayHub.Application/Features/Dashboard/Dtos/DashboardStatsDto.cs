namespace PlayHub.Application.Features.Dashboard.Dtos;

public class DashboardStatsDto
{
    public int ManagedCourts { get; set; }
    public int ReservationsMonth { get; set; }
    public int UniqueClients { get; set; }
    public decimal MonthlyRevenue { get; set; }
}
