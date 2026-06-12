namespace FlowerHouse.Admin.Models.Users;
public class UserDto { public int Id { get; set; } public string Phone { get; set; } = ""; public string? Name { get; set; } public string Role { get; set; } = ""; public bool IsBlocked { get; set; } public int OrderCount { get; set; } public decimal TotalSpent { get; set; } public DateTime CreatedAt { get; set; } }
