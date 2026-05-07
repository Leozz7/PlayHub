using Microsoft.AspNetCore.SignalR;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Infrastructure.Hubs;
using System.Threading.Tasks;

namespace PlayHub.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyReservationCreated(string courtId, string startTime)
    {
        await _hubContext.Clients.All.SendAsync("ReservationCreated", new { CourtId = courtId, StartTime = startTime });
    }

    public async Task SendNotification(string message)
    {
        await _hubContext.Clients.All.SendAsync("ReceiveNotification", message);
    }
}
