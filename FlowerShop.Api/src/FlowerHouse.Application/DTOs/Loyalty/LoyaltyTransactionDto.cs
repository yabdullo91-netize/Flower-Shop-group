using System;

namespace FlowerHouse.Application.DTOs.Loyalty;

public class LoyaltyTransactionDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public int Points { get; set; }
    public string? Description { get; set; }
    public Guid? OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
