namespace FlowerHouse.Admin.Models.Common;
public class ApiErrorResponse { public string Message { get; set; } = ""; public string? Details { get; set; } public Dictionary<string, string[]>? Errors { get; set; } }
