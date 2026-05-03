using MongoDB.Driver;
using PlayHub.Application.Common.Interfaces;
using PlayHub.Application.Common.Security;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Constants;

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
        var exists = await context.Courts.Find(_ => true).AnyAsync(ct);
        if (exists) return;

        var courts = new List<Court>
        {
            new Court("Arena Central Paulista", CourtType.Fut7, 150, 20, "A principal arena da capital"),
            new Court("Beach Club Sport", CourtType.Basquete, 110, 10, "Complexo de esportes de areia"),
            new Court("Sport Center Sul", CourtType.Basquete, 85, 12, "Quadras poliesportivas modernas"),
            new Court("Quadra Premium Vila", CourtType.Tenis, 130, 4, "Tênis e Padel de alta qualidade"),
            new Court("Padel Experience", CourtType.Other, 180, 4, "A melhor experiência de Padel"),
            new Court("Vôlei Sunset", CourtType.Volei, 70, 12, "Vôlei de praia com vista para o mar")
        };

        // Court 1
        courts[0].UpdateLocation("Avenida Paulista, 1578", "Paulista", "São Paulo", "SP");
        courts[0].UpdateBusinessData(200, "Melhor Avaliada", 5.0, 312);
        courts[0].UpdateSchedule(6, 23);
        courts[0].UpdateSports(new List<string> { "Futebol Society", "Futsal" });
        courts[0].UpdateImages(new List<string> { "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80" });

        // Court 2
        courts[1].UpdateLocation("Avenida Giovanni Gronchi, 5930", "Morumbi", "São Paulo", "SP");
        courts[1].UpdateBusinessData(null, "Café da Manhã", 4.9, 218);
        courts[1].UpdateSchedule(7, 22);
        courts[1].UpdateSports(new List<string> { "Beach Tennis", "Vôlei de Praia" });
        courts[1].UpdateImages(new List<string> { "https://images.unsplash.com/photo-1485395037613-e83d5c1f5ac4?auto=format&fit=crop&w=800&q=80" });

        // Court 3
        courts[2].UpdateLocation("Rua das Figueiras, 400", "Santo André", "São Paulo", "SP");
        courts[2].UpdateBusinessData(null, "Reserva Antecipada", 4.8, 145);
        courts[2].UpdateSchedule(8, 21);
        courts[2].UpdateSports(new List<string> { "Basquete", "Futsal", "Handebol" });
        courts[2].UpdateImages(new List<string> { "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80" });

        // Court 4
        courts[3].UpdateLocation("Rua Funchal, 200", "Vila Olímpia", "São Paulo", "SP");
        courts[3].UpdateBusinessData(null, null, 4.7, 89);
        courts[3].UpdateSchedule(6, 22);
        courts[3].UpdateSports(new List<string> { "Tênis", "Padel" });
        courts[3].UpdateImages(new List<string> { "https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?auto=format&fit=crop&w=800&q=80" });

        // Court 5
        courts[4].UpdateLocation("Avenida das Américas, 4666", "Barra da Tijuca", "Rio de Janeiro", "RJ");
        courts[4].UpdateBusinessData(null, "Mais Reservado", 4.9, 276);
        courts[4].UpdateSchedule(7, 23);
        courts[4].UpdateSports(new List<string> { "Padel", "Tênis" });
        courts[4].UpdateImages(new List<string> { "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80" });

        await context.Courts.InsertManyAsync(courts, cancellationToken: ct);
    }
}
