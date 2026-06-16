using FlowerHouse.Application.DTOs.Orders;
using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using FlowerHouse.Domain.Enums;
using FlowerHouse.Domain.Interfaces;
using FlowerHouse.Infrastructure.Persistence;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace FlowerHouse.Application.Services;

public class OrderService(
    AppDbContext db,
    IFileStorageService fileStorageService,
    IPromoService promoService) : IOrderService
{
    public async Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request)
    {
        // 1. Generate Order Number
        var rand = new Random();
        var orderNum = $"FH-{DateTime.UtcNow:yyyyMMdd}-{rand.Next(1000, 9999)}";

        // 2. Fetch User
        var user = await db.Users.FindAsync(userId);
        if (user is null)
            throw new Exception("User not found.");

        decimal subtotal = 0;
        var orderItems = new List<OrderItem>();

        // 3. Process Products & calculate subtotal
        foreach (var itemReq in request.Items)
        {
            var product = await db.Products
                .Include(p => p.Sizes)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == itemReq.ProductId && p.IsActive);

            if (product is null)
                throw new Exception($"Product {itemReq.ProductId} not found or inactive.");

            decimal unitPrice = product.BasePrice ?? 0;
            if (!string.IsNullOrEmpty(itemReq.SizeLabel))
            {
                var size = product.Sizes.FirstOrDefault(s => s.Label == itemReq.SizeLabel);
                if (size is not null)
                {
                    unitPrice = size.Price;
                }
            }

            if (!string.IsNullOrEmpty(itemReq.Packaging))
            {
                var pkg = await db.ProductPackagingOptions
                    .FirstOrDefaultAsync(p => p.ProductId == product.Id && p.Type == itemReq.Packaging);
                if (pkg is not null)
                {
                    unitPrice += pkg.PriceDelta;
                }
            }

            var primaryImg = product.Images.FirstOrDefault(i => i.IsPrimary)?.Url ?? product.Images.FirstOrDefault()?.Url;

            var orderItem = new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ProductImg = primaryImg,
                SizeLabel = itemReq.SizeLabel,
                Packaging = itemReq.Packaging,
                StemCount = itemReq.StemCount,
                Quantity = itemReq.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = unitPrice * itemReq.Quantity
            };

            subtotal += orderItem.TotalPrice;
            orderItems.Add(orderItem);
        }

        // 4. Process Addons
        var orderAddons = new List<OrderAddon>();
        foreach (var addonReq in request.Addons)
        {
            var addon = await db.Addons.FindAsync(addonReq.AddonId);
            if (addon is null || !addon.IsActive)
                throw new Exception($"Addon {addonReq.AddonId} not found or inactive.");

            var orderAddon = new OrderAddon
            {
                AddonId = addon.Id,
                AddonName = addon.Name,
                Price = addon.Price,
                Quantity = addonReq.Quantity,
                Inscription = addonReq.Inscription
            };

            subtotal += orderAddon.Price * addonReq.Quantity;
            orderAddons.Add(orderAddon);
        }

        // 5. Promo Code check
        decimal discountAmount = 0;
        if (!string.IsNullOrWhiteSpace(request.PromoCode))
        {
            var promo = await db.PromoCodes
                .FirstOrDefaultAsync(x => x.Code == request.PromoCode && x.IsActive);

            if (promo is not null)
            {
                if (promo.ValidFrom.HasValue && promo.ValidFrom.Value > DateTime.UtcNow)
                    throw new Exception("Promo code not active yet.");
                if (promo.ValidUntil.HasValue && promo.ValidUntil.Value < DateTime.UtcNow)
                    throw new Exception("Promo code expired.");
                if (promo.MaxUses.HasValue && promo.UsedCount >= promo.MaxUses.Value)
                    throw new Exception("Promo code usage limit reached.");
                if (promo.MinOrder.HasValue && subtotal < promo.MinOrder.Value)
                    throw new Exception($"Minimum order amount is {promo.MinOrder.Value}.");

                if (promo.DiscountPct.HasValue)
                    discountAmount = subtotal * promo.DiscountPct.Value / 100;
                else if (promo.DiscountFixed.HasValue)
                    discountAmount = promo.DiscountFixed.Value;

                promo.UsedCount++;
            }
        }

        // 6. Points deduction
        int pointsRedeemed = 0;
        if (request.PointsRedeemed > 0)
        {
            var loyaltyAccount = await db.LoyaltyAccounts
                .FirstOrDefaultAsync(la => la.UserId == userId);

            if (loyaltyAccount is null || loyaltyAccount.Points < request.PointsRedeemed)
                throw new Exception("Insufficient loyalty points.");

            pointsRedeemed = request.PointsRedeemed;
            // 1 point = 1 unit discount
            discountAmount += pointsRedeemed;

            loyaltyAccount.Points -= pointsRedeemed;

            db.LoyaltyTransactions.Add(new LoyaltyTransaction
            {
                UserId = userId,
                Type = "Redemption",
                Points = -pointsRedeemed,
                Description = $"Used points on order {orderNum}"
            });
        }

        // 7. Delivery fee (flat 40.00, free for orders above 1500.00)
        decimal deliveryFee = subtotal >= 1500 ? 0 : 40;
        decimal total = Math.Max(0, subtotal - discountAmount + deliveryFee);

        // 8. Create Order
        var order = new Order
        {
            OrderNumber = orderNum,
            UserId = userId,
            Status = OrderStatus.Accepted,
            RecipientName = request.RecipientName,
            RecipientPhone = request.RecipientPhone,
            IsGift = request.IsGift,
            IsAnonymous = request.IsAnonymous,
            PostcardId = request.PostcardId,
            CardText = request.CardText,
            DeliveryAddress = request.DeliveryAddress,
            DeliveryDate = request.DeliveryDate,
            DeliveryTimeSlot = request.DeliveryTimeSlot,
            PaymentMethod = request.PaymentMethod,
            Subtotal = subtotal,
            DiscountAmount = discountAmount,
            DeliveryFee = deliveryFee,
            PointsRedeemed = pointsRedeemed,
            Total = total,
            PromoCode = request.PromoCode,
            IsCancellable = true
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync(); // get Order ID

        // Save items and addons
        foreach (var item in orderItems)
        {
            item.OrderId = order.Id;
            db.OrderItems.Add(item);
        }

        foreach (var addon in orderAddons)
        {
            addon.OrderId = order.Id;
            db.OrderAddons.Add(addon);
        }

        // Save status history
        db.OrderStatusHistories.Add(new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = OrderStatus.Accepted,
            Note = "Order placed."
        });

        await db.SaveChangesAsync();

        return order.Adapt<OrderDto>();
    }

    public async Task<List<OrderDto>> GetMyOrdersAsync(Guid userId)
    {
        return await db.Orders
            .Include(x => x.Items)
            .Include(x => x.Addons)
            .Include(x => x.StatusHistory)
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectToType<OrderDto>()
            .ToListAsync();
    }

    public async Task<OrderDto?> GetMyOrderByIdAsync(Guid userId, Guid orderId)
    {
        var order = await db.Orders
            .Include(x => x.Items)
            .Include(x => x.Addons)
            .Include(x => x.StatusHistory)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Id == orderId);

        return order?.Adapt<OrderDto>();
    }

    public async Task<bool> CancelMyOrderAsync(Guid userId, Guid orderId)
    {
        var order = await db.Orders
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Id == orderId);

        if (order is null || !order.IsCancellable || order.Status == OrderStatus.Cancelled || order.Status == OrderStatus.Delivered)
            return false;

        order.Status = OrderStatus.Cancelled;
        order.IsCancellable = false;
        order.UpdatedAt = DateTime.UtcNow;

        // Refund points if any were redeemed
        if (order.PointsRedeemed > 0)
        {
            var loyaltyAccount = await db.LoyaltyAccounts
                .FirstOrDefaultAsync(la => la.UserId == userId);

            if (loyaltyAccount is not null)
            {
                loyaltyAccount.Points += order.PointsRedeemed;

                db.LoyaltyTransactions.Add(new LoyaltyTransaction
                {
                    UserId = userId,
                    Type = "Refund",
                    Points = order.PointsRedeemed,
                    Description = $"Refunded points for cancelled order {order.OrderNumber}",
                    OrderId = order.Id
                });
            }
        }

        db.OrderStatusHistories.Add(new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = OrderStatus.Cancelled,
            Note = "Cancelled by customer."
        });

        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<OrderDto>> GetAllOrdersAsync(string? status, Guid? userId)
    {
        var query = db.Orders
            .Include(x => x.Items)
            .Include(x => x.Addons)
            .Include(x => x.StatusHistory)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, true, out var orderStatus))
        {
            query = query.Where(x => x.Status == orderStatus);
        }

        if (userId.HasValue)
        {
            query = query.Where(x => x.UserId == userId.Value);
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .ProjectToType<OrderDto>()
            .ToListAsync();
    }

    public async Task<OrderDto?> GetOrderByIdAsync(Guid orderId)
    {
        var order = await db.Orders
            .Include(x => x.Items)
            .Include(x => x.Addons)
            .Include(x => x.StatusHistory)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == orderId);

        return order?.Adapt<OrderDto>();
    }

    public async Task<bool> UpdateOrderStatusAsync(Guid orderId, string status, string? comment, Guid adminId)
    {
        var order = await db.Orders
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == orderId);

        if (order is null)
            return false;

        if (!Enum.TryParse<OrderStatus>(status, true, out var newStatus))
            return false;

        if (order.Status == newStatus)
            return true;

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;

        if (newStatus == OrderStatus.Delivered || newStatus == OrderStatus.Cancelled || newStatus == OrderStatus.Delivering)
        {
            order.IsCancellable = false;
        }

        // Accrue loyalty points when Delivered
        if (newStatus == OrderStatus.Delivered)
        {
            var loyaltyAccount = await db.LoyaltyAccounts
                .FirstOrDefaultAsync(la => la.UserId == order.UserId);

            if (loyaltyAccount is null)
            {
                loyaltyAccount = new LoyaltyAccount
                {
                    UserId = order.UserId,
                    Points = 0,
                    TotalEarned = 0,
                    Tier = "Bronze"
                };
                db.LoyaltyAccounts.Add(loyaltyAccount);
            }

            // Accrue 10% of total order value as points
            int pointsEarned = (int)Math.Floor(order.Total * 0.1m);
            if (pointsEarned > 0)
            {
                loyaltyAccount.Points += pointsEarned;
                loyaltyAccount.TotalEarned += pointsEarned;

                // Adjust Tier based on total earned
                if (loyaltyAccount.TotalEarned >= 1000)
                    loyaltyAccount.Tier = "Gold";
                else if (loyaltyAccount.TotalEarned >= 500)
                    loyaltyAccount.Tier = "Silver";

                db.LoyaltyTransactions.Add(new LoyaltyTransaction
                {
                    UserId = order.UserId,
                    Type = "Accrual",
                    Points = pointsEarned,
                    Description = $"Earned points on order {order.OrderNumber}",
                    OrderId = order.Id
                });
            }
        }

        // Refund points if Cancelled by admin
        if (newStatus == OrderStatus.Cancelled && order.PointsRedeemed > 0)
        {
            var loyaltyAccount = await db.LoyaltyAccounts
                .FirstOrDefaultAsync(la => la.UserId == order.UserId);

            if (loyaltyAccount is not null)
            {
                loyaltyAccount.Points += order.PointsRedeemed;

                db.LoyaltyTransactions.Add(new LoyaltyTransaction
                {
                    UserId = order.UserId,
                    Type = "Refund",
                    Points = order.PointsRedeemed,
                    Description = $"Refunded points for cancelled order {order.OrderNumber}",
                    OrderId = order.Id
                });
            }
        }

        db.OrderStatusHistories.Add(new OrderStatusHistory
        {
            OrderId = order.Id,
            Status = newStatus,
            ChangedBy = adminId,
            Note = comment ?? $"Status updated to {newStatus} by admin."
        });

        await db.SaveChangesAsync();
        return true;
    }

    public async Task<string> UploadOrderPhotoAsync(Guid orderId, Stream fileStream, string fileName)
    {
        var order = await db.Orders.FindAsync(orderId);
        if (order is null)
            throw new Exception("Order not found.");

        var photoUrl = await fileStorageService.SaveFileAsync(fileStream, fileName, "orders");
        order.OrderPhotoUrl = photoUrl;
        order.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return photoUrl;
    }
}
