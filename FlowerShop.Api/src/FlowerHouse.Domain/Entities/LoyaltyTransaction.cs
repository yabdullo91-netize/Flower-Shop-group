namespace FlowerHouse.Domain.Entities;

public class LoyaltyTransaction : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Type { get; set; } = string.Empty;
    public int Points { get; set; }
    public string? Description { get; set; }

    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }
}