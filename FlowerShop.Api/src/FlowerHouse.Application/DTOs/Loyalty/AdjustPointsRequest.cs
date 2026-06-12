using System;

namespace FlowerHouse.Application.DTOs.Loyalty;

public class AdjustPointsRequest
{
    public Guid UserId { get; set; }
    public int Points { get; set; }
    public string Description { get; set; } = string.Empty;
}
