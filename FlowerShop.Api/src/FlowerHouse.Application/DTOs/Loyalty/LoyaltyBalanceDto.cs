namespace FlowerHouse.Application.DTOs.Loyalty;

public class LoyaltyBalanceDto
{
    public int Points { get; set; }
    public int TotalEarned { get; set; }
    public string Tier { get; set; } = "Bronze";
}
