using PlayHub.Domain.Enums;

namespace PlayHub.Application.Common.Extensions;

public static class CourtTypeExtensions
{
    public static string ToFriendlyString(this CourtType type)
    {
        return type switch
        {
            CourtType.Tenis => "Tênis",
            CourtType.Fut7 => "Futebol Society",
            CourtType.FutVolei => "Futevôlei",
            CourtType.Volei => "Vôlei",
            CourtType.Basquete => "Basquete",
            CourtType.Futsal => "Futsal",
            CourtType.BeachTennis => "Beach Tennis",
            CourtType.Padel => "Padel",
            CourtType.Handebol => "Handebol",
            CourtType.Other => "Outro",
            _ => "Outro"
        };
    }
}
