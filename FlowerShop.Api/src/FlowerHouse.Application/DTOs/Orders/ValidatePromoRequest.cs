namespace FlowerHouse.Application.DTOs.Orders;

public class ValidatePromoRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderTotal { get; set; }
}