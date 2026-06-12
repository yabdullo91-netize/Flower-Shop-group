using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using FlowerHouse.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlowerHouse.Application.Services;

public class ContentService(AppDbContext db) : IContentService
{
    public async Task<List<Banner>> GetBannersAsync()
    {
        return await db.Banners
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync();
    }

    public async Task<List<DeliveryTimeSlot>> GetDeliverySlotsAsync()
    {
        return await db.DeliveryTimeSlots
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync();
    }

    // Addons
    public async Task<List<Addon>> GetAddonsAsync()
    {
        return await db.Addons
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync();
    }

    public async Task<Addon> CreateAddonAsync(Addon addon)
    {
        db.Addons.Add(addon);
        await db.SaveChangesAsync();
        return addon;
    }

    public async Task<Addon> UpdateAddonAsync(Guid id, Addon addon)
    {
        var existing = await db.Addons.FindAsync(id);
        if (existing is null)
            throw new Exception("Addon not found.");

        existing.Name = addon.Name;
        existing.Type = addon.Type;
        existing.ImageUrl = addon.ImageUrl;
        existing.Price = addon.Price;
        existing.HasInscription = addon.HasInscription;
        existing.SortOrder = addon.SortOrder;
        existing.IsActive = addon.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAddonAsync(Guid id)
    {
        var existing = await db.Addons.FindAsync(id);
        if (existing is null)
            return false;

        existing.IsActive = false;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    // Postcards
    public async Task<List<Postcard>> GetPostcardsAsync()
    {
        return await db.Postcards
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ToListAsync();
    }

    public async Task<Postcard> CreatePostcardAsync(Postcard postcard)
    {
        db.Postcards.Add(postcard);
        await db.SaveChangesAsync();
        return postcard;
    }

    public async Task<Postcard> UpdatePostcardAsync(Guid id, Postcard postcard)
    {
        var existing = await db.Postcards.FindAsync(id);
        if (existing is null)
            throw new Exception("Postcard not found.");

        existing.Occasion = postcard.Occasion;
        existing.ImageUrl = postcard.ImageUrl;
        existing.IsPopular = postcard.IsPopular;
        existing.SortOrder = postcard.SortOrder;
        existing.IsActive = postcard.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeletePostcardAsync(Guid id)
    {
        var existing = await db.Postcards.FindAsync(id);
        if (existing is null)
            return false;

        existing.IsActive = false;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    // Message Templates
    public async Task<List<MessageTemplate>> GetMessageTemplatesAsync()
    {
        return await db.MessageTemplates
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Category)
            .ToListAsync();
    }

    public async Task<MessageTemplate> CreateMessageTemplateAsync(MessageTemplate template)
    {
        db.MessageTemplates.Add(template);
        await db.SaveChangesAsync();
        return template;
    }

    public async Task<MessageTemplate> UpdateMessageTemplateAsync(Guid id, MessageTemplate template)
    {
        var existing = await db.MessageTemplates.FindAsync(id);
        if (existing is null)
            throw new Exception("Message template not found.");

        existing.Category = template.Category;
        existing.Text = template.Text;
        existing.IsPopular = template.IsPopular;
        existing.IsActive = template.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteMessageTemplateAsync(Guid id)
    {
        var existing = await db.MessageTemplates.FindAsync(id);
        if (existing is null)
            return false;

        existing.IsActive = false;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    // Banners (Admin CRUD)
    public async Task<Banner> CreateBannerAsync(Banner banner)
    {
        db.Banners.Add(banner);
        await db.SaveChangesAsync();
        return banner;
    }

    public async Task<Banner> UpdateBannerAsync(Guid id, Banner banner)
    {
        var existing = await db.Banners.FindAsync(id);
        if (existing is null)
            throw new Exception("Banner not found.");

        existing.Title = banner.Title;
        existing.ImageUrl = banner.ImageUrl;
        existing.Link = banner.Link;
        existing.SortOrder = banner.SortOrder;
        existing.IsActive = banner.IsActive;
        existing.StartsAt = banner.StartsAt;
        existing.EndsAt = banner.EndsAt;
        existing.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteBannerAsync(Guid id)
    {
        var existing = await db.Banners.FindAsync(id);
        if (existing is null)
            return false;

        existing.IsActive = false;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    // Delivery slots (Admin CRUD)
    public async Task<DeliveryTimeSlot> CreateDeliverySlotAsync(DeliveryTimeSlot slot)
    {
        db.DeliveryTimeSlots.Add(slot);
        await db.SaveChangesAsync();
        return slot;
    }

    public async Task<DeliveryTimeSlot> UpdateDeliverySlotAsync(Guid id, DeliveryTimeSlot slot)
    {
        var existing = await db.DeliveryTimeSlots.FindAsync(id);
        if (existing is null)
            throw new Exception("Delivery slot not found.");

        existing.Label = slot.Label;
        existing.FromHour = slot.FromHour;
        existing.ToHour = slot.ToHour;
        existing.SortOrder = slot.SortOrder;
        existing.IsActive = slot.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteDeliverySlotAsync(Guid id)
    {
        var existing = await db.DeliveryTimeSlots.FindAsync(id);
        if (existing is null)
            return false;

        existing.IsActive = false;
        existing.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }
}