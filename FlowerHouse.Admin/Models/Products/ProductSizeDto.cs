namespace FlowerHouse.Admin.Models.Products;

/// <summary>
/// Размерная вариация товара (например, «Стандарт», «Большой»).
/// </summary>
public class ProductSizeDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Label { get => Name; set => Name = value; }
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public string? ImageUrl { get; set; }
}
