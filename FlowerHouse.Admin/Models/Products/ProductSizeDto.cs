namespace FlowerHouse.Admin.Models.Products;

/// <summary>
/// Размерная вариация товара (например, «Стандарт», «Большой»).
/// </summary>
public class ProductSizeDto
{
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}
