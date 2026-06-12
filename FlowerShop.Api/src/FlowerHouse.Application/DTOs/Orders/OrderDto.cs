using System;
using System.Collections.Generic;

namespace FlowerHouse.Application.DTOs.Orders;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Status { get; set; } = string.Empty;

    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public bool IsGift { get; set; }
    public bool IsAnonymous { get; set; }

    public Guid? PostcardId { get; set; }
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
    public bool IsCancellable { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<OrderItemDto> Items { get; set; } = [];
    public List<OrderAddonDto> Addons { get; set; } = [];
    public List<OrderStatusHistoryDto> StatusHistory { get; set; } = [];
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImg { get; set; }
    public string? SizeLabel { get; set; }
    public string? Packaging { get; set; }
    public int? StemCount { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}

public class OrderAddonDto
{
    public Guid Id { get; set; }
    public Guid AddonId { get; set; }
    public string AddonName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string? Inscription { get; set; }
}

public class OrderStatusHistoryDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}
