namespace FlowerHouse.Domain.Entities;

public class ProductPackagingOption : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Type { get; set; } = string.Empty;
    public decimal PriceDelta { get; set; }
}