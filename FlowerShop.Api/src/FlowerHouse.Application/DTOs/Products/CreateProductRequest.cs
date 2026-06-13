namespace FlowerHouse.Application.DTOs.Products;

public class CreateProductRequest
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Composition { get; set; }
    public string? Description { get; set; }
    public string Kind { get; set; } = "bouquet";
    public string Freshness { get; set; } = "live";
    public decimal? BasePrice { get; set; }
    public bool IsNew { get; set; }
    public bool IsHit { get; set; }
    public bool InStock { get; set; } = true;
    public bool DeliverToday { get; set; }
    public List<string> Occasions { get; set; } = [];
    public List<string> FlowerTypes { get; set; } = [];
    public List<string> Colors { get; set; } = [];
    public List<SizeUpsertRequest> Sizes { get; set; } = [];
    public List<PackagingUpsertRequest> PackagingOptions { get; set; } = [];
    public List<StemUpsertRequest> StemOptions { get; set; } = [];
}

public record SizeUpsertRequest(string Label, decimal Price, decimal? OldPrice, string? ImageUrl);
public record PackagingUpsertRequest(string Type, decimal PriceDelta);
public record StemUpsertRequest(int Count, decimal Price);