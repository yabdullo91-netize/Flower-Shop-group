namespace FlowerHouse.Admin.Models.Orders;
public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = "";
    public string Status { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public string? DeliveryTimeSlot { get; set; }
    public string CustomerName { get; set; } = "";
    public string CustomerPhone { get; set; } = "";
    public string RecipientName { get; set; } = "";
    public string RecipientPhone { get; set; } = "";
    public string DeliveryAddress { get; set; } = "";
    public List<OrderItemDto> Items { get; set; } = [];
    public List<OrderAddonDto>? Addons { get; set; }
    public string? PostcardText { get; set; }
    public string? CardText { get => PostcardText; set => PostcardText = value; }
    public string? PostcardImageUrl { get; set; }
    public bool IsAnonymous { get; set; }
    public decimal Subtotal { get; set; }
    public decimal DeliveryFee { get; set; }
    public decimal Discount { get; set; }
    public decimal DiscountAmount { get => Discount; set => Discount = value; }
    public decimal BonusUsed { get; set; }
    public int PointsRedeemed { get => (int)BonusUsed; set => BonusUsed = value; }
    public decimal Total { get; set; }
    public string? PromoCode { get; set; }
    public string PaymentMethod { get; set; } = "";
    public string? PhotoUrl { get; set; }
    public string? OrderPhotoUrl { get => PhotoUrl; set => PhotoUrl = value; }
    public List<OrderTimelineDto>? Timeline { get; set; }
    public List<OrderTimelineDto>? StatusHistory { get => Timeline; set => Timeline = value; }
}
