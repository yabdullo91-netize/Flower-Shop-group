namespace FlowerHouse.Domain.Entities;

public class Addon : BaseEntity
{
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Emoji { get; set; }
    public string? ImageUrl { get; set; }
    public decimal Price { get; set; }
    public bool HasInscription { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}