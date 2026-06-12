namespace FlowerHouse.Domain.Entities;

public class OrderAddon : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid AddonId { get; set; }
    public Addon Addon { get; set; } = null!;

    public string AddonName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; } = 1;
    public string? Inscription { get; set; }
}