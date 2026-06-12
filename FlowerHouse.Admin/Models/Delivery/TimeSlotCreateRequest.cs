namespace FlowerHouse.Admin.Models.Delivery;
public class TimeSlotCreateRequest { public string StartTime { get; set; } = ""; public string EndTime { get; set; } = ""; public bool IsActive { get; set; } public int MaxOrders { get; set; } }
