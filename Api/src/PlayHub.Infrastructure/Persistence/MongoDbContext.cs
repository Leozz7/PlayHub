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

    public IMongoCollection<Review> Reviews =>
        _database.GetCollection<Review>("reviews");

    public IMongoCollection<Reservation> Reservations =>
        _database.GetCollection<Reservation>("reservations");

    public IMongoCollection<Payment> Payments =>
        _database.GetCollection<Payment>("payments");

    public IMongoCollection<SystemLog> SystemLogs =>
        _database.GetCollection<SystemLog>("system_logs");

    public IMongoCollection<Invoice> Invoices =>
        _database.GetCollection<Invoice>("invoices");

    public MongoDbContext(IMongoClient client, string databaseName)
    {
        _database = client.GetDatabase(databaseName);
    }

    public async Task InitializeAsync(CancellationToken ct = default)
    {
        var emailIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.EmailIndex),
            new CreateIndexOptions { Unique = true, Name = "email_idx_unique" });
        await Users.Indexes.CreateOneAsync(emailIndex, cancellationToken: ct);

        var roleIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Role),
            new CreateIndexOptions { Name = "role_idx" });
        await Users.Indexes.CreateOneAsync(roleIndex, cancellationToken: ct);

        var reservationCompoundIndex = new CreateIndexModel<Reservation>(
            Builders<Reservation>.IndexKeys
                .Ascending(r => r.CourtId)
                .Ascending(r => r.StartTime)
                .Ascending(r => r.EndTime),
            new CreateIndexOptions { Name = "court_starttime_endtime_idx" });
        await Reservations.Indexes.CreateOneAsync(reservationCompoundIndex, cancellationToken: ct);

        var recurringGroupIndex = new CreateIndexModel<Reservation>(
            Builders<Reservation>.IndexKeys.Ascending(r => r.RecurringGroupId),
            new CreateIndexOptions { Name = "recurring_group_idx", Sparse = true });
        await Reservations.Indexes.CreateOneAsync(recurringGroupIndex, cancellationToken: ct);

        var invoiceGroupIndex = new CreateIndexModel<Invoice>(
            Builders<Invoice>.IndexKeys.Ascending(i => i.RecurringGroupId),
            new CreateIndexOptions { Name = "invoice_group_idx" });
        await Invoices.Indexes.CreateOneAsync(invoiceGroupIndex, cancellationToken: ct);

        var invoiceUserIndex = new CreateIndexModel<Invoice>(
            Builders<Invoice>.IndexKeys.Ascending(i => i.UserId),
            new CreateIndexOptions { Name = "invoice_user_idx" });
        await Invoices.Indexes.CreateOneAsync(invoiceUserIndex, cancellationToken: ct);

        var paymentReservationIndex = new CreateIndexModel<Payment>(
            Builders<Payment>.IndexKeys.Ascending(p => p.ReservationId),
            new CreateIndexOptions { Name = "reservation_idx" });
        await Payments.Indexes.CreateOneAsync(paymentReservationIndex, cancellationToken: ct);

        var logLevelIndex = new CreateIndexModel<SystemLog>(
            Builders<SystemLog>.IndexKeys.Ascending(l => l.Level),
            new CreateIndexOptions { Name = "level_idx" });
        await SystemLogs.Indexes.CreateOneAsync(logLevelIndex, cancellationToken: ct);

        var reviewCourtIndex = new CreateIndexModel<Review>(
            Builders<Review>.IndexKeys.Ascending(r => r.CourtId),
            new CreateIndexOptions { Name = "review_court_idx" });
        await Reviews.Indexes.CreateOneAsync(reviewCourtIndex, cancellationToken: ct);

        var reviewUniqueIndex = new CreateIndexModel<Review>(
            Builders<Review>.IndexKeys.Ascending(r => r.CourtId).Ascending(r => r.UserId),
            new CreateIndexOptions { Unique = true, Name = "review_unique_user_court" });
        await Reviews.Indexes.CreateOneAsync(reviewUniqueIndex, cancellationToken: ct);
    }
}
