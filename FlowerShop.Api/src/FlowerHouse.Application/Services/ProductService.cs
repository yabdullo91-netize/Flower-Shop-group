using FlowerHouse.Application.DTOs.Common;
using FlowerHouse.Application.DTOs.Products;
using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
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

public class ProductService(AppDbContext db, IFileStorageService fileStorageService) : IProductService
{
    public async Task<PagedResult<ProductDto>> GetAllAsync(
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
        int pageSize)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 12 : pageSize;

        var query = db.Products
            .Include(x => x.Sizes)
            .Include(x => x.Images)
            .AsNoTracking()
            .Where(x => x.IsActive);

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(x => x.Name.ToLower().Contains(q.ToLower()));

        if (!string.IsNullOrWhiteSpace(occasion))
            query = query.Where(x => x.Occasions.Contains(occasion));

        if (!string.IsNullOrWhiteSpace(freshness))
            query = query.Where(x => x.Freshness == freshness);

        if (!string.IsNullOrWhiteSpace(kind))
            query = query.Where(x => x.Kind == kind);

        if (deliverToday.HasValue)
            query = query.Where(x => x.DeliverToday == deliverToday.Value);

        if (!string.IsNullOrWhiteSpace(packaging))
        {
            var productIdsWithPackaging = await db.ProductPackagingOptions
                .Where(x => x.Type.ToLower() == packaging.ToLower())
                .Select(x => x.ProductId)
                .Distinct()
                .ToListAsync();

            query = query.Where(x => productIdsWithPackaging.Contains(x.Id));
        }

        if (priceMin.HasValue)
        {
            query = query.Where(x => (x.BasePrice >= priceMin.Value) || x.Sizes.Any(s => s.Price >= priceMin.Value));
        }

        if (priceMax.HasValue)
        {
            query = query.Where(x => (x.BasePrice <= priceMax.Value) || x.Sizes.Any(s => s.Price <= priceMax.Value));
        }

        if (!string.IsNullOrWhiteSpace(sort))
        {
            query = sort.ToLower() switch
            {
                "price_asc" => query.OrderBy(x => x.BasePrice ?? (x.Sizes.OrderBy(s => s.Price).Select(s => s.Price).FirstOrDefault())),
                "price_desc" => query.OrderByDescending(x => x.BasePrice ?? (x.Sizes.OrderByDescending(s => s.Price).Select(s => s.Price).FirstOrDefault())),
                "new" => query.OrderByDescending(x => x.CreatedAt),
                "popular" => query.OrderByDescending(x => x.IsHit).ThenBy(x => x.SortOrder),
                _ => query.OrderBy(x => x.SortOrder)
            };
        }
        else
        {
            query = query.OrderBy(x => x.SortOrder);
        }

        var total = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectToType<ProductDto>()
            .ToListAsync();

        return new PagedResult<ProductDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = total
        };
    }

    public async Task<ProductDto?> GetBySlugAsync(string slug)
    {
        var product = await db.Products
            .Include(x => x.Sizes)
            .Include(x => x.Images)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Slug == slug && x.IsActive);

        return product?.Adapt<ProductDto>();
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request)
    {
        var product = request.Adapt<Product>();
        db.Products.Add(product);
        await db.SaveChangesAsync();

        return product.Adapt<ProductDto>();
    }

    public async Task<ProductDto> UpdateAsync(Guid id, CreateProductRequest request)
    {
        var product = await db.Products
            .Include(x => x.Sizes)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (product is null)
            throw new Exception("Product not found.");

        request.Adapt(product);
        product.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return product.Adapt<ProductDto>();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var product = await db.Products.FindAsync(id);

        if (product is null)
            return false;

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<ProductDto>> GetHitsAsync()
    {
        return await db.Products
            .Include(x => x.Sizes)
            .Include(x => x.Images)
            .AsNoTracking()
            .Where(x => x.IsActive && x.IsHit)
            .OrderBy(x => x.SortOrder)
            .ProjectToType<ProductDto>()
            .ToListAsync();
    }

    public async Task<string> AddImageAsync(Guid productId, Stream fileStream, string fileName, bool isPrimary)
    {
        var product = await db.Products.FindAsync(productId);
        if (product is null)
            throw new Exception("Product not found.");

        var imageUrl = await fileStorageService.SaveFileAsync(fileStream, fileName, "products");

        if (isPrimary)
        {
            var oldPrimaryImages = await db.ProductImages
                .Where(x => x.ProductId == productId && x.IsPrimary)
                .ToListAsync();
            foreach (var img in oldPrimaryImages)
            {
                img.IsPrimary = false;
            }
        }

        var productImage = new ProductImage
        {
            ProductId = productId,
            Url = imageUrl,
            IsPrimary = isPrimary,
            SortOrder = 0
        };

        db.ProductImages.Add(productImage);
        await db.SaveChangesAsync();

        return imageUrl;
    }

    public async Task<bool> DeleteImageAsync(Guid productId, Guid imgId)
    {
        var image = await db.ProductImages
            .FirstOrDefaultAsync(x => x.ProductId == productId && x.Id == imgId);

        if (image is null)
            return false;

        await fileStorageService.DeleteFileAsync(image.Url);

        db.ProductImages.Remove(image);
        await db.SaveChangesAsync();
        return true;
    }
}