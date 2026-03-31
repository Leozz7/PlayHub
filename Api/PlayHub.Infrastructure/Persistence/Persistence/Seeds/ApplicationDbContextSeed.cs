using MongoDB.Driver;
using PlayHub.Application.Common.Security;
using PlayHub.Domain.Entities;

namespace PlayHub.Infrastructure.Persistence;

public static class ApplicationDbContextSeed
{
    public static async Task SeedAdminAsync(
        MongoDbContext context,
        PasswordHasher hasher,
        CancellationToken ct = default)
    {
        const string adminEmail = "leandro@gmail.com";

        var exists = await context.Users
            .Find(u => u.Email == adminEmail)
            .AnyAsync(ct);

        if (exists) return;

        var passwordHash = hasher.Hash("1234567");

        var admin = new User(
            name: "Leandro",
            email: adminEmail,
            passwordHash: passwordHash,
            role: "Admin"
        );

        await context.Users.InsertOneAsync(admin, cancellationToken: ct);
    }
}
