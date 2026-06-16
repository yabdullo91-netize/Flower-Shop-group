namespace FlowerHouse.Admin.Models.Delivery;
public class TimeSlotDto { public Guid Id { get; set; } public string StartTime { get; set; } = ""; public string EndTime { get; set; } = ""; public bool IsActive { get; set; } public int MaxOrders { get; set; } public int CurrentOrders { get; set; } }
