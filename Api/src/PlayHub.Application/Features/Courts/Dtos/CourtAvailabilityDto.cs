using System.Collections.Generic;

namespace PlayHub.Application.Features.Courts.Dtos;

public class CourtAvailabilityDto
{
    public int OpeningHour { get; set; }
    public int ClosingHour { get; set; }
    public List<int> BusySlots { get; set; } = new();
    public bool Available { get; set; }
}
