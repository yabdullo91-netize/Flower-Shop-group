namespace FlowerHouse.Domain.Entities;

public class LoyaltyAccount : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public int Points { get; set; }
    public int TotalEarned { get; set; }
    public string Tier { get; set; } = "Bronze";
}