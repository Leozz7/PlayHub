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

    public MongoDbContext(IMongoClient client, string databaseName)
    {
        _database = client.GetDatabase(databaseName);
        ConfigureIndexes();
    }

    private void ConfigureIndexes()
    {
        var emailIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Unique = true, Name = "email_unique" });

        Users.Indexes.CreateOne(emailIndex);

        var roleIndex = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Role),
            new CreateIndexOptions { Name = "role_idx" });

        Users.Indexes.CreateOne(roleIndex);
    }
}
