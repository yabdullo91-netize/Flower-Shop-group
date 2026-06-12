namespace FlowerHouse.Admin.Models.Settings;
public class AuditLogDto { public int Id { get; set; } public DateTime Timestamp { get; set; } public string UserName { get; set; } = ""; public string Action { get; set; } = ""; public string? Details { get; set; } public string? IpAddress { get; set; } }
