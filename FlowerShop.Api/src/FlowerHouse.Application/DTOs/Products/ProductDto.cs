namespace FlowerHouse.Application.DTOs.Products;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Composition { get; set; }
    public string? Description { get; set; }
    public string Kind { get; set; } = string.Empty;
    public string Freshness { get; set; } = string.Empty;
    public decimal? BasePrice { get; set; }
    public bool IsNew { get; set; }
    public bool IsHit { get; set; }
    public bool InStock { get; set; }
    public bool DeliverToday { get; set; }
    public decimal Rating { get; set; }
    public int ReviewCount { get; set; }

    public string[] Occasions { get; set; } = [];
    public string[] FlowerTypes { get; set; } = [];
    public string[] Colors { get; set; } = [];

    public List<ProductSizeDto> Sizes { get; set; } = [];
    public List<ProductImageDto> Images { get; set; } = [];
    public List<ProductPackagingOptionDto> PackagingOptions { get; set; } = [];
    public List<ProductStemOptionDto> StemOptions { get; set; } = [];
}

public class ProductSizeDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OldPrice { get; set; }
    public string? ImageUrl { get; set; }
}

public class ProductImageDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}

public class ProductPackagingOptionDto
{
    public string Type { get; set; } = string.Empty;
    public decimal PriceDelta { get; set; }
}

public class ProductStemOptionDto
{
    public int Count { get; set; }
    public decimal Price { get; set; }
}
