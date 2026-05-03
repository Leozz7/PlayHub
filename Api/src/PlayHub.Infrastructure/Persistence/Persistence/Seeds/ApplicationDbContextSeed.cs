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

        void AddCourt(Court court, string address, string neighborhood, string city, string state, decimal? oldPrice, string? badge, double rating, int reviewCount, List<string> sports, List<string> images)
        {
            if (!existingCourtNames.Contains(court.Name))
            {
                court.UpdateLocation(address, neighborhood, city, state);
                court.UpdateBusinessData(oldPrice, badge, rating, reviewCount);
                court.UpdateSchedule(6, 23);
                court.UpdateSports(sports);
                court.UpdateImages(images);
                courtsToSeed.Add((court, address, neighborhood, city, state, oldPrice, badge, rating, reviewCount, sports, images));
            }
        }

        // Original Courts
        AddCourt(new Court("Arena Central Paulista", CourtType.Fut7, 150, 20, "A principal arena da capital"), "Avenida Paulista, 1578", "Paulista", "São Paulo", "SP", 200, "Melhor Avaliada", 5.0, 312, new List<string> { "Futebol Society", "Futsal" }, new List<string> { "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80" });
        AddCourt(new Court("Beach Club Sport", CourtType.Basquete, 110, 10, "Complexo de esportes de areia"), "Avenida Giovanni Gronchi, 5930", "Morumbi", "São Paulo", "SP", null, "Café da Manhã", 4.9, 218, new List<string> { "Beach Tennis", "Vôlei de Praia" }, new List<string> { "https://images.unsplash.com/photo-1485395037613-e83d5c1f5ac4?auto=format&fit=crop&w=800&q=80" });
        AddCourt(new Court("Sport Center Sul", CourtType.Basquete, 85, 12, "Quadras poliesportivas modernas"), "Rua das Figueiras, 400", "Santo André", "São Paulo", "SP", null, "Reserva Antecipada", 4.8, 145, new List<string> { "Basquete", "Futsal", "Handebol" }, new List<string> { "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80" });
        AddCourt(new Court("Quadra Premium Vila", CourtType.Tenis, 130, 4, "Tênis e Padel de alta qualidade"), "Rua Funchal, 200", "Vila Olímpia", "São Paulo", "SP", null, null, 4.7, 89, new List<string> { "Tênis", "Padel" }, new List<string> { "https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?auto=format&fit=crop&w=800&q=80" });
        AddCourt(new Court("Padel Experience", CourtType.Other, 180, 4, "A melhor experiência de Padel"), "Avenida das Américas, 4666", "Barra da Tijuca", "Rio de Janeiro", "RJ", null, "Mais Reservado", 4.9, 276, new List<string> { "Padel", "Tênis" }, new List<string> { "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80" });
        AddCourt(new Court("Vôlei Sunset", CourtType.Volei, 70, 12, "Vôlei de praia com vista para o mar"), "Rua da Praia, 10", "Copacabana", "Rio de Janeiro", "RJ", null, null, 4.8, 150, new List<string> { "Vôlei de Praia" }, new List<string> { "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80" });

        // New 15 Courts
        AddCourt(new Court("Arena Araci Futsal", CourtType.Other, 80, 10, "A melhor quadra de futsal de Araci"), "Rua Central, 10", "Centro", "Araci", "BA", 100, "Novo", 4.8, 45, new List<string> { "Futsal" }, new List<string>());
        AddCourt(new Court("Vôlei Teofilândia", CourtType.Volei, 60, 12, "Vôlei de qualidade em Teofilândia"), "Rua das Flores, 50", "Jardim", "Teofilândia", "BA", null, "Popular", 4.5, 28, new List<string> { "Vôlei" }, new List<string>());
        AddCourt(new Court("Basquete Serrinha Club", CourtType.Basquete, 90, 12, "Enterre com estilo em Serrinha"), "Av. Principal, 100", "Centro", "Serrinha", "BA", 120, "Destaque", 4.7, 56, new List<string> { "Basquete" }, new List<string>());
        AddCourt(new Court("Futevôlei Feira Prime", CourtType.Other, 100, 4, "Areia de primeira em Feira de Santana"), "Rua da Areia, 200", "Kalilândia", "Feira de Santana", "BA", null, "Premium", 4.9, 89, new List<string> { "Futevôlei" }, new List<string>());
        AddCourt(new Court("Araci Sport Center", CourtType.Basquete, 75, 15, "Complexo poliesportivo em Araci"), "Rua do Esporte, 30", "Alto", "Araci", "BA", null, null, 4.6, 34, new List<string> { "Basquete", "Futsal" }, new List<string>());
        AddCourt(new Court("Serrinha Futsal Arena", CourtType.Other, 85, 10, "Futsal de alto nível"), "Rua da Bola, 45", "Centro", "Serrinha", "BA", null, null, 4.8, 67, new List<string> { "Futsal" }, new List<string>());
        AddCourt(new Court("Feira Vôlei Park", CourtType.Volei, 70, 12, "Vôlei para toda a família"), "Av. Getúlio Vargas, 1500", "Centro", "Feira de Santana", "BA", null, null, 4.4, 42, new List<string> { "Vôlei" }, new List<string>());
        AddCourt(new Court("Teofilândia Basquete City", CourtType.Basquete, 65, 10, "A quadra da galera em Teofilândia"), "Rua da Cesta, 12", "Centro", "Teofilândia", "BA", null, null, 4.3, 19, new List<string> { "Basquete" }, new List<string>());
        AddCourt(new Court("Araci Beach Tennis & Futevôlei", CourtType.Other, 95, 4, "Esportes de areia em Araci"), "Rua da Praia, 88", "Centro", "Araci", "BA", 130, "Verão", 4.9, 23, new List<string> { "Futevôlei", "Beach Tennis" }, new List<string>());
        AddCourt(new Court("Serrinha Vôlei Show", CourtType.Volei, 70, 12, "O melhor vôlei da região"), "Rua do Vôlei, 77", "Estação", "Serrinha", "BA", null, null, 4.7, 31, new List<string> { "Vôlei" }, new List<string>());
        AddCourt(new Court("Feira Futsal Elite", CourtType.Other, 110, 10, "Elite do futsal em Feira"), "Rua dos Craques, 99", "Santa Mônica", "Feira de Santana", "BA", 150, "Top 1", 5.0, 120, new List<string> { "Futsal" }, new List<string>());
        AddCourt(new Court("Teofilândia Futevôlei Arena", CourtType.Other, 80, 4, "Sinta a areia de Teofilândia"), "Av. das Palmeiras, 10", "Centro", "Teofilândia", "BA", null, null, 4.6, 15, new List<string> { "Futevôlei" }, new List<string>());
        AddCourt(new Court("Serrinha Basquete Top", CourtType.Basquete, 85, 12, "Top basquete em Serrinha"), "Rua da Quadra, 55", "Centro", "Serrinha", "BA", null, null, 4.5, 22, new List<string> { "Basquete" }, new List<string>());
        AddCourt(new Court("Feira Sport Mix", CourtType.Other, 120, 20, "Multiesportiva em Feira"), "Rua do Mix, 123", "Cidade Nova", "Feira de Santana", "BA", null, "Completa", 4.8, 54, new List<string> { "Futsal", "Basquete", "Vôlei" }, new List<string>());
        AddCourt(new Court("Araci Vôlei Club", CourtType.Volei, 65, 12, "Clube de vôlei tradicional"), "Rua das Redes, 11", "Centro", "Araci", "BA", null, null, 4.2, 12, new List<string> { "Vôlei" }, new List<string>());

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
