namespace FlowerShop.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }

    public ICollection<Product> Products { get; set; } = [];
}
