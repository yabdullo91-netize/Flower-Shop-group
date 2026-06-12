using FlowerHouse.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FlowerHouse.Application.Interfaces;

public interface IContentService
{
    Task<List<Banner>> GetBannersAsync();
    Task<List<DeliveryTimeSlot>> GetDeliverySlotsAsync();

    // Addons
    Task<List<Addon>> GetAddonsAsync();
    Task<Addon> CreateAddonAsync(Addon addon);
    Task<Addon> UpdateAddonAsync(Guid id, Addon addon);
    Task<bool> DeleteAddonAsync(Guid id);

    // Postcards
    Task<List<Postcard>> GetPostcardsAsync();
    Task<Postcard> CreatePostcardAsync(Postcard postcard);
    Task<Postcard> UpdatePostcardAsync(Guid id, Postcard postcard);
    Task<bool> DeletePostcardAsync(Guid id);

    // Message Templates
    Task<List<MessageTemplate>> GetMessageTemplatesAsync();
    Task<MessageTemplate> CreateMessageTemplateAsync(MessageTemplate template);
    Task<MessageTemplate> UpdateMessageTemplateAsync(Guid id, MessageTemplate template);
    Task<bool> DeleteMessageTemplateAsync(Guid id);

    // Banners (Admin CRUD)
    Task<Banner> CreateBannerAsync(Banner banner);
    Task<Banner> UpdateBannerAsync(Guid id, Banner banner);
    Task<bool> DeleteBannerAsync(Guid id);

    // Delivery slots (Admin CRUD)
    Task<DeliveryTimeSlot> CreateDeliverySlotAsync(DeliveryTimeSlot slot);
    Task<DeliveryTimeSlot> UpdateDeliverySlotAsync(Guid id, DeliveryTimeSlot slot);
    Task<bool> DeleteDeliverySlotAsync(Guid id);
}