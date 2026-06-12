namespace FlowerHouse.Application.DTOs.Products;

public class CreateProductRequest
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Composition { get; set; }
    public string? Description { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string Freshness { get; set; } = string.Empty;
    public decimal? BasePrice { get; set; }
    public List<string> Occasions { get; set; } = [];
    public List<string> FlowerTypes { get; set; } = [];
    public List<string> Colors { get; set; } = [];
}