using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Serializers;
using PlayHub.Domain.Common;
using PlayHub.Domain.Entities;

namespace PlayHub.Infrastructure.Persistence;

public static class MongoDbBsonConfiguration
{
    private static bool _configured;
    private static readonly Lock _lock = new();

    public static void Configure()
    {
        lock (_lock)
        {
            if (_configured) return;
            var pack = new ConventionPack
            {
                new CamelCaseElementNameConvention(),    
                new IgnoreExtraElementsConvention(true), 
                new EnumRepresentationConvention(BsonType.String)
            };
            ConventionRegistry.Register("PlayHubConventions", pack, _ => true);

            BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));

            if (!BsonClassMap.IsClassMapRegistered(typeof(BaseEntity)))
            {
                BsonClassMap.RegisterClassMap<BaseEntity>(cm =>
                {
                    cm.AutoMap();
                    cm.MapIdProperty(e => e.Id)
                      .SetIdGenerator(new GuidGenerator())
                      .SetSerializer(new GuidSerializer(GuidRepresentation.Standard));
                    cm.SetIsRootClass(true);
                });
            }

            if (!BsonClassMap.IsClassMapRegistered(typeof(User)))
            {
                BsonClassMap.RegisterClassMap<User>(cm =>
                {
                    cm.AutoMap();
                    cm.SetIgnoreExtraElements(true);
                });
            }

            if (!BsonClassMap.IsClassMapRegistered(typeof(Court)))
            {
                BsonClassMap.RegisterClassMap<Court>(cm =>
                {
                    cm.AutoMap();
                    cm.SetIgnoreExtraElements(true);
                });
            }

            if (!BsonClassMap.IsClassMapRegistered(typeof(Reservation)))
            {
                BsonClassMap.RegisterClassMap<Reservation>(cm =>
                {
                    cm.AutoMap();
                    cm.SetIgnoreExtraElements(true);
                });
            }

            if (!BsonClassMap.IsClassMapRegistered(typeof(Payment)))
            {
                BsonClassMap.RegisterClassMap<Payment>(cm =>
                {
                    cm.AutoMap();
                    cm.SetIgnoreExtraElements(true);
                });
            }

            if (!BsonClassMap.IsClassMapRegistered(typeof(SystemLog)))
            {
                BsonClassMap.RegisterClassMap<SystemLog>(cm =>
                {
                    cm.AutoMap();
                    cm.SetIgnoreExtraElements(true);
                });
            }

            _configured = true;
        }
    }
}

file sealed class GuidGenerator : IIdGenerator
{
    public object GenerateId(object container, object document) => Guid.NewGuid();
    public bool IsEmpty(object id) => id is Guid g && g == Guid.Empty;
}
