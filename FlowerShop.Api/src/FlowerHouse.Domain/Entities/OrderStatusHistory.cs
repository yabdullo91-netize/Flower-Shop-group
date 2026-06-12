using FlowerHouse.Domain.Enums;

namespace FlowerHouse.Domain.Entities;

public class OrderStatusHistory : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public OrderStatus Status { get; set; }

    public Guid? ChangedBy { get; set; }
    public User? ChangedByUser { get; set; }

    public string? Note { get; set; }
}