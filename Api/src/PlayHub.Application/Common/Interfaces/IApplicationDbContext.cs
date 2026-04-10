using MongoDB.Driver;
using PlayHub.Domain.Entities;

namespace PlayHub.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    IMongoCollection<User> Users { get; }
    IMongoCollection<Court> Courts { get; }
    IMongoCollection<Reservation> Reservations { get; }
    IMongoCollection<Payment> Payments { get; }
    IMongoCollection<SystemLog> SystemLogs { get; }
}