namespace FlowerHouse.Domain.Entities;

public class DeliveryTimeSlot : BaseEntity
{
    public string Label { get; set; } = string.Empty;
    public int FromHour { get; set; }
    public int ToHour { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
}