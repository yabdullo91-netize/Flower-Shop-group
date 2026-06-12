namespace FlowerHouse.Admin.Models.Loyalty;
public class AdjustPointsRequest { public int UserId { get; set; } public int Amount { get; set; } public string Reason { get; set; } = ""; }
