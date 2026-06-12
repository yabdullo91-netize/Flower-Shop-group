using FlowerHouse.Application.DTOs.Orders;
using FlowerHouse.Application.Interfaces;
using FlowerHouse.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlowerHouse.Application.Services;

public class PromoService(AppDbContext db) : IPromoService
{
    public async Task<object> ValidateAsync(ValidatePromoRequest request)
    {
        var promo = await db.PromoCodes
            .FirstOrDefaultAsync(x => x.Code == request.Code && x.IsActive);

        if (promo is null)
            return new { valid = false, message = "Promo code not found." };

        if (promo.ValidFrom.HasValue && promo.ValidFrom.Value > DateTime.UtcNow)
            return new { valid = false, message = "Promo code not active yet." };

        if (promo.ValidUntil.HasValue && promo.ValidUntil.Value < DateTime.UtcNow)
            return new { valid = false, message = "Promo code expired." };

        if (promo.MinOrder.HasValue && request.OrderTotal < promo.MinOrder.Value)
            return new { valid = false, message = "Minimum order amount is not reached." };

        if (promo.MaxUses.HasValue && promo.UsedCount >= promo.MaxUses.Value)
            return new { valid = false, message = "Promo usage limit reached." };

        decimal discount = 0;

        if (promo.DiscountPct.HasValue)
            discount = request.OrderTotal * promo.DiscountPct.Value / 100;

        if (promo.DiscountFixed.HasValue)
            discount = promo.DiscountFixed.Value;

        return new
        {
            valid = true,
            discount
        };
    }
}