namespace FlowerHouse.Domain.Entities;

public class ProductStemOption : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Count { get; set; }
    public decimal Price { get; set; }
}