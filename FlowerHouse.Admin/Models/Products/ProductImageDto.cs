namespace FlowerHouse.Admin.Models.Products;
public class ProductImageDto { public Guid Id { get; set; } public string Url { get; set; } = ""; public bool IsMain { get; set; } public bool IsPrimary { get => IsMain; set => IsMain = value; } public int SortOrder { get; set; } }
