using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Serializers;
using PlayHub.Domain.Common;
using PlayHub.Domain.Entities;
using PlayHub.Domain.Enums;

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
                    cm.MapField("_amenities").SetElementName("amenities");
                    cm.MapField("_sports").SetElementName("sports");
                    cm.MapField("_imageUrls").SetElementName("imageUrls");
                    cm.MapField("_images").SetElementName("images");
                    cm.MapField("_schedules").SetElementName("schedules");
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

            if (!BsonClassMap.IsClassMapRegistered(typeof(Invoice)))
            {
                BsonClassMap.RegisterClassMap<Invoice>(cm =>
                {
                    cm.AutoMap();
                    cm.MapField("_reservationIds").SetElementName("reservationIds");
                    cm.SetIgnoreExtraElements(true);
                });
            }

            if (!BsonClassMap.IsClassMapRegistered(typeof(OperatingDay)))
            {
                BsonClassMap.RegisterClassMap<OperatingDay>(cm =>
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

file sealed class LogLevelSerializer : SerializerBase<LogLevel>
{
    public override LogLevel Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var type = context.Reader.GetCurrentBsonType();
        if (type == BsonType.Int32)
            return (LogLevel)context.Reader.ReadInt32();
            
        if (type == BsonType.String)
        {
            var value = context.Reader.ReadString();
            return value switch
            {
                "Verbose" => LogLevel.Info,
                "Debug" => LogLevel.Info,
                "Information" => LogLevel.Info,
                "Warning" => LogLevel.Warning,
                "Error" => LogLevel.Error,
                "Fatal" => LogLevel.Critical,
                "Info" => LogLevel.Info,
                "Critical" => LogLevel.Critical,
                _ => LogLevel.Info
            };
        }
        
        context.Reader.SkipValue();
        return LogLevel.Info;
    }

    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, LogLevel value)
    {
        context.Writer.WriteString(value.ToString());
    }
}
