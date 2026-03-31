using MongoDB.Driver;
using PlayHub.Domain.Entities;

namespace PlayHub.Application.Common.Interfaces;

/// <summary>
/// Abstração do contexto de dados MongoDB para uso nos handlers da Application.
/// Não expõe detalhes de implementação do driver — apenas as coleções necessárias.
/// </summary>
public interface IApplicationDbContext
{
    IMongoCollection<User> Users { get; }
}