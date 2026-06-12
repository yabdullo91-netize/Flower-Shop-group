using FlowerHouse.Application.DTOs.Products;
using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using FlowerHouse.Infrastructure.Persistence;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FlowerHouse.Application.Services;

public class FavoriteService(AppDbContext db) : IFavoriteService
{
    public async Task<List<ProductDto>> GetMyFavoritesAsync(Guid userId)
    {
        return await db.Favorites
            .Where(x => x.UserId == userId)
            .Include(x => x.Product)
            .Select(x => x.Product)
            .ProjectToType<ProductDto>()
            .ToListAsync();
    }

    public async Task AddAsync(Guid userId, Guid productId)
    {
        var exists = await db.Favorites.AnyAsync(x => x.UserId == userId && x.ProductId == productId);

        if (exists)
            return;

        db.Favorites.Add(new Favorite
        {
            UserId = userId,
            ProductId = productId
        });

        await db.SaveChangesAsync();
    }

    public async Task RemoveAsync(Guid userId, Guid productId)
    {
        var favorite = await db.Favorites.FindAsync(userId, productId);

        if (favorite is null)
            return;

        db.Favorites.Remove(favorite);
        await db.SaveChangesAsync();
    }
}