using FlowerHouse.Domain.Enums;

namespace FlowerHouse.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public OrderStatus Status { get; set; } = OrderStatus.Accepted;

    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public bool IsGift { get; set; }
    public bool IsAnonymous { get; set; }

    public Guid? PostcardId { get; set; }
    public Postcard? Postcard { get; set; }
    public string? CardText { get; set; }

    public string DeliveryAddress { get; set; } = string.Empty;
    public DateOnly DeliveryDate { get; set; }
    public string DeliveryTimeSlot { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = string.Empty;

    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal DeliveryFee { get; set; }
    public int PointsRedeemed { get; set; }
    public decimal Total { get; set; }

    public string? PromoCode { get; set; }
    public string? OrderPhotoUrl { get; set; }
    public bool IsCancellable { get; set; } = true;

    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<OrderAddon> Addons { get; set; } = [];
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = [];
}