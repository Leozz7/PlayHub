using System.Globalization;
using PlayHub.Api.Extensions;

var culture = new CultureInfo("pt-BR");
CultureInfo.DefaultThreadCurrentCulture = culture;
CultureInfo.DefaultThreadCurrentUICulture = culture;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

// Validação de Configurações 
var encryptionKey = builder.Configuration["ENCRYPTION_KEY"];
if (string.IsNullOrEmpty(encryptionKey) || (builder.Environment.IsProduction() && encryptionKey.Length < 32))
{
    throw new InvalidOperationException("⚠️ A ENCRYPTION_KEY crítica não está configurada ou é insegura para Produção.");
}

// Serilog
builder.Host.AddCustomLogging();

// API Services
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

// Configure Pipeline
app.UseApiPipeline();

// Seed Database
await app.SeedDatabaseAsync();

await app.RunAsync();