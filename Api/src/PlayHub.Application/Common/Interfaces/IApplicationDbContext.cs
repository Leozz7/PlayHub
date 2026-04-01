using MongoDB.Driver;
using PlayHub.Domain.Entities;

namespace PlayHub.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    IMongoCollection<User> Users { get; }
}