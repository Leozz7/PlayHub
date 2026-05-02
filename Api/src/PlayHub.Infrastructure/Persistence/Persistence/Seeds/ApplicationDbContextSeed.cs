using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Domain.Entities;

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
            role: AppRole.Admin
        );

        await context.Users.InsertOneAsync(admin, cancellationToken: ct);
    }
}
