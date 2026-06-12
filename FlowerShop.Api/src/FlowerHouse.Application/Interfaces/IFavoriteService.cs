using FlowerHouse.Application.DTOs.Products;

namespace FlowerHouse.Application.Interfaces;

public interface IFavoriteService
{
    Task<List<ProductDto>> GetMyFavoritesAsync(Guid userId);
    Task AddAsync(Guid userId, Guid productId);
    Task RemoveAsync(Guid userId, Guid productId);
}
