using System;
using System.Collections.Generic;

namespace FlowerHouse.Application.DTOs.Orders;

public class CreateOrderRequest
{
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
    public int PointsRedeemed { get; set; }
    public string? PromoCode { get; set; }

    public List<CreateOrderItemDto> Items { get; set; } = [];
    public List<CreateOrderAddonDto> Addons { get; set; } = [];
}

public class CreateOrderItemDto
{
    public Guid ProductId { get; set; }
    public string? SizeLabel { get; set; }
    public string? Packaging { get; set; }
    public int? StemCount { get; set; }
    public int Quantity { get; set; }
}

public class CreateOrderAddonDto
{
    public Guid AddonId { get; set; }
    public int Quantity { get; set; }
    public string? Inscription { get; set; }
}
