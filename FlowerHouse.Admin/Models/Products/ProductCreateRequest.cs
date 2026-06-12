namespace FlowerHouse.Admin.Models.Products;

/// <summary>
/// Запрос на создание или обновление товара.
/// </summary>
public class ProductCreateRequest
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int CategoryId { get; set; }
    public List<string> Tags { get; set; } = [];
    public bool IsActive { get; set; }
    public bool DeliverToday { get; set; }
    public string? Occasion { get; set; }
    public string? Freshness { get; set; }
    public string? Kind { get; set; }
    public string? Packaging { get; set; }
    public List<ProductSizeDto>? Sizes { get; set; }
}
