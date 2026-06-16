namespace FlowerHouse.Admin.Models.Orders;
public class OrderTimelineDto { public string Status { get; set; } = ""; public DateTime Timestamp { get; set; } public DateTime CreatedAt { get => Timestamp; set => Timestamp = value; } public string? Comment { get; set; } public string? Note { get => Comment; set => Comment = value; } }
