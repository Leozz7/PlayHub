using PlayHub.Domain.Enums;
using PlayHub.Domain.Entities;
using System.Collections.Generic;
using System.Linq;

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

    public static string ToFriendlySportString(this Court court)
    {
        if (court.Sports != null && court.Sports.Any())
        {
            if (court.Sports.Count > 1 || court.Type == CourtType.Other)
            {
                return string.Join(", ", court.Sports);
            }
        }

        return court.Type.ToFriendlyString();
    }
}
