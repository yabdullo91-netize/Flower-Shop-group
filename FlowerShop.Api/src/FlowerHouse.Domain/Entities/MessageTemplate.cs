namespace FlowerHouse.Domain.Entities;

public class MessageTemplate : BaseEntity
{
    public string Category { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public bool IsPopular { get; set; }
    public bool IsActive { get; set; } = true;
}