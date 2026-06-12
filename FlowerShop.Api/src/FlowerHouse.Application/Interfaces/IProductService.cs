using FlowerHouse.Application.DTOs.Common;
using FlowerHouse.Application.DTOs.Products;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace FlowerHouse.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetAllAsync(
        string? q,
        string? occasion,
        string? freshness,
        string? kind,
        string? packaging,
        decimal? priceMin,
        decimal? priceMax,
        bool? deliverToday,
        string? sort,
        int page,
        int pageSize);

    Task<ProductDto?> GetBySlugAsync(string slug);
    Task<ProductDto> CreateAsync(CreateProductRequest request);
    Task<ProductDto> UpdateAsync(Guid id, CreateProductRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<List<ProductDto>> GetHitsAsync();
    Task<string> AddImageAsync(Guid productId, Stream fileStream, string fileName, bool isPrimary);
    Task<bool> DeleteImageAsync(Guid productId, Guid imgId);
}