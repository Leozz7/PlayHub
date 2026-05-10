using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Constants;
using PlayHub.Domain.Enums;

namespace PlayHub.Infrastructure.Persistence;

public static class ApplicationDbContextSeed
{
    public static async Task SeedAdminAsync(
        MongoDbContext context,
        PasswordHasher hasher,
        IEncryptionService encryptionService,
        CancellationToken ct = default)
    {
        const string adminEmail = "leandro@gmail.com";
        var emailIndex = encryptionService.CreateBlindIndex(adminEmail);

        var exists = await context.Users
            .Find(u => u.EmailIndex == emailIndex)
            .AnyAsync(ct);

        if (exists) return;

        var passwordHash = hasher.Hash("1234567");
        var encryptedEmail = encryptionService.Encrypt(adminEmail);

        var admin = new User(
            name: "Leandro Admin",
            email: encryptedEmail,
            emailIndex: emailIndex,
            passwordHash: passwordHash,
            role: AppRoles.Admin
        );

        await context.Users.InsertOneAsync(admin, cancellationToken: ct);
    }

    public static async Task SeedCourtsAsync(MongoDbContext context, CancellationToken ct = default)
    {
        var existingCourtNames = await context.Courts.Find(_ => true)
            .Project(c => c.Name)
            .ToListAsync(ct);

        var courtsToSeed = new List<(Court Court, string Address, string Neighborhood, string City, string State, decimal? OldPrice, string? Badge, double Rating, int ReviewCount, List<string> Sports, List<string> Images)>();

        if (courtsToSeed.Any())
        {
            await context.Courts.InsertManyAsync(courtsToSeed.Select(x => x.Court), cancellationToken: ct);
        }

        // Fix existing courts with 0 reviews to have 5.0 rating
        var fixFilter = Builders<Court>.Filter.Eq(c => c.ReviewCount, 0);
        var fixUpdate = Builders<Court>.Update.Set(c => c.Rating, 5.0);
        await context.Courts.UpdateManyAsync(fixFilter, fixUpdate, cancellationToken: ct);
    }
}
