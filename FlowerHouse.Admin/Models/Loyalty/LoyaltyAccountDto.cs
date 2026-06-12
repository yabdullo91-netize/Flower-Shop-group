namespace FlowerHouse.Admin.Models.Loyalty;
public class LoyaltyAccountDto { public int UserId { get; set; } public string UserName { get; set; } = ""; public string UserPhone { get; set; } = ""; public int Balance { get; set; } public string Tier { get; set; } = ""; public int TotalEarned { get; set; } public int TotalSpent { get; set; } }
