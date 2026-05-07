using System.Threading.Tasks;

namespace PlayHub.Application.Common.Interfaces;

public interface INotificationService
{
    Task NotifyReservationCreated(string courtId, string startTime);
    Task SendNotification(string message);
}
