namespace FlowerHouse.Domain.Entities;

public class Banner : BaseEntity
{
    public string? Title { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Link { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
}