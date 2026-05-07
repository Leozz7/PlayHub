using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace PlayHub.Infrastructure.Hubs;

public class NotificationHub : Hub
{
    public async Task SendNotification(string message)
    {
        await Clients.All.SendAsync("ReceiveNotification", message);
    }

    public async Task NotifyReservationCreated(string courtId, string startTime)
    {
        await Clients.All.SendAsync("ReservationCreated", new { CourtId = courtId, StartTime = startTime });
    }
}
