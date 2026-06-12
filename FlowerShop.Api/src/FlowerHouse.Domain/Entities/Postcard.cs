namespace FlowerHouse.Domain.Entities;

public class Postcard : BaseEntity
{
    public string Occasion { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPopular { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}