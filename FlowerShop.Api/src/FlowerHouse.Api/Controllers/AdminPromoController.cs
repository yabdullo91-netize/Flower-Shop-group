using FlowerHouse.Domain.Entities;
using FlowerHouse.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize(Roles = "SuperAdmin")]
[Route("api/admin/promo-codes")]
public class AdminPromoController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var promos = await db.PromoCodes
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
        return Ok(promos);
    }

    [HttpPost]
    public async Task<IActionResult> Create(PromoCode promo)
    {
        var exists = await db.PromoCodes.AnyAsync(x => x.Code == promo.Code);
        if (exists)
            return BadRequest("Promo code already exists.");

        db.PromoCodes.Add(promo);
        await db.SaveChangesAsync();
        return CreatedAtRoute(null, promo);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, PromoCode promo)
    {
        var existing = await db.PromoCodes.FindAsync(id);
        if (existing is null)
            return NotFound();

        existing.Code = promo.Code;
        existing.DiscountPct = promo.DiscountPct;
        existing.DiscountFixed = promo.DiscountFixed;
        existing.MinOrder = promo.MinOrder;
        existing.MaxUses = promo.MaxUses;
        existing.ValidFrom = promo.ValidFrom;
        existing.ValidUntil = promo.ValidUntil;
        existing.IsActive = promo.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var promo = await db.PromoCodes.FindAsync(id);
        if (promo is null)
            return NotFound();

        promo.IsActive = false;
        promo.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
