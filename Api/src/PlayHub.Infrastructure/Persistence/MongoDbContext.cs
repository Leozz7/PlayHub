using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Domain.Entities;

namespace PlayHub.Infrastructure.Persistence;

public sealed class MongoDbContext : IApplicationDbContext
{
    private readonly IMongoDatabase _database;

    public IMongoCollection<User> Users =>
        _database.GetCollection<User>("users");

    public IMongoCollection<Court> Courts =>
        _database.GetCollection<Court>("courts");

    public IMongoCollection<Reservation> Reservations =>
        _database.GetCollection<Reservation>("reservations");

    public IMongoCollection<Payment> Payments =>
        _database.GetCollection<Payment>("payments");

    public IMongoCollection<SystemLog> SystemLogs =>
        _database.GetCollection<SystemLog>("system_logs");

    public MongoDbContext(IMongoClient client, string databaseName)
    {
        _database = client.GetDatabase(databaseName);
        ConfigureIndexes();
    }

    private void ConfigureIndexes()
    {
        var emailIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.EmailIndex),
            new CreateIndexOptions { Unique = true, Name = "email_idx_unique" });

        Users.Indexes.CreateOne(emailIndex);

        var roleIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Role),
            new CreateIndexOptions { Name = "role_idx" });

        Users.Indexes.CreateOne(roleIndex);

        var reservationCourtIndex = new CreateIndexModel<Reservation>(
            Builders<Reservation>.IndexKeys.Ascending(r => r.CourtId),
            new CreateIndexOptions { Name = "court_idx" });

        Reservations.Indexes.CreateOne(reservationCourtIndex);

        var paymentReservationIndex = new CreateIndexModel<Payment>(
            Builders<Payment>.IndexKeys.Ascending(p => p.ReservationId),
            new CreateIndexOptions { Name = "reservation_idx" });

        Payments.Indexes.CreateOne(paymentReservationIndex);

        var logLevelIndex = new CreateIndexModel<SystemLog>(
            Builders<SystemLog>.IndexKeys.Ascending(l => l.Level),
            new CreateIndexOptions { Name = "level_idx" });

        SystemLogs.Indexes.CreateOne(logLevelIndex);
    }
}
