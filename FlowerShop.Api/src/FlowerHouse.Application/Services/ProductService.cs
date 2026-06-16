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
            .Include(x => x.PackagingOptions)
            .Include(x => x.StemOptions)
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
            query = query.Where(x => (x.BasePrice >= priceMin.Value) || x.Sizes.Any(s => s.Price >= priceMin.Value));

        if (priceMax.HasValue)
            query = query.Where(x => (x.BasePrice <= priceMax.Value) || x.Sizes.Any(s => s.Price <= priceMax.Value));

        if (!string.IsNullOrWhiteSpace(sort))
        {
            query = sort.ToLower() switch
            {
                "price_asc"  => query.OrderBy(x => x.BasePrice ?? (x.Sizes.OrderBy(s => s.Price).Select(s => s.Price).FirstOrDefault())),
                "price_desc" => query.OrderByDescending(x => x.BasePrice ?? (x.Sizes.OrderByDescending(s => s.Price).Select(s => s.Price).FirstOrDefault())),
                "new" or "newest" => query.OrderByDescending(x => x.CreatedAt),
                "popular"    => query.OrderByDescending(x => x.IsHit).ThenBy(x => x.SortOrder),
                "rating"     => query.OrderByDescending(x => x.Rating).ThenByDescending(x => x.ReviewCount),
                _            => query.OrderBy(x => x.SortOrder)
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

        return new PagedResult<ProductDto> { Items = items, Page = page, PageSize = pageSize, TotalCount = total };
    }

    public async Task<ProductDto?> GetBySlugAsync(string slug)
    {
        var product = await db.Products
            .Include(x => x.Sizes)
            .Include(x => x.Images)
            .Include(x => x.PackagingOptions)
            .Include(x => x.StemOptions)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Slug == slug && x.IsActive);

        return product?.Adapt<ProductDto>();
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request)
    {
        var product = new Product
        {
            Slug          = request.Slug,
            Name          = request.Name,
            Composition   = request.Composition,
            Description   = request.Description,
            Kind          = request.Kind,
            Freshness     = request.Freshness,
            BasePrice     = request.BasePrice,
            IsNew         = request.IsNew,
            IsHit         = request.IsHit,
            InStock       = request.InStock,
            DeliverToday  = request.DeliverToday,
            Occasions     = [.. request.Occasions],
            FlowerTypes   = [.. request.FlowerTypes],
            Colors        = [.. request.Colors],
        };

        foreach (var s in request.Sizes)
            product.Sizes.Add(new ProductSize { Label = s.Label, Price = s.Price, OldPrice = s.OldPrice, ImageUrl = s.ImageUrl });

        foreach (var p in request.PackagingOptions)
            product.PackagingOptions.Add(new ProductPackagingOption { Type = p.Type, PriceDelta = p.PriceDelta });

        foreach (var s in request.StemOptions)
            product.StemOptions.Add(new ProductStemOption { Count = s.Count, Price = s.Price });

        db.Products.Add(product);
        await db.SaveChangesAsync();

        return product.Adapt<ProductDto>();
    }

    public async Task<ProductDto> UpdateAsync(Guid id, CreateProductRequest request)
    {
        var product = await db.Products
            .Include(x => x.Sizes)
            .Include(x => x.PackagingOptions)
            .Include(x => x.StemOptions)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (product is null)
            throw new Exception("Product not found.");

        product.Slug         = request.Slug;
        product.Name         = request.Name;
        product.Composition  = request.Composition;
        product.Description  = request.Description;
        product.Kind         = request.Kind;
        product.Freshness    = request.Freshness;
        product.BasePrice    = request.BasePrice;
        product.IsNew        = request.IsNew;
        product.IsHit        = request.IsHit;
        product.InStock      = request.InStock;
        product.DeliverToday = request.DeliverToday;
        product.Occasions    = [.. request.Occasions];
        product.FlowerTypes  = [.. request.FlowerTypes];
        product.Colors       = [.. request.Colors];
        product.UpdatedAt    = DateTime.UtcNow;

        db.ProductSizes.RemoveRange(product.Sizes);
        product.Sizes.Clear();
        foreach (var s in request.Sizes)
            product.Sizes.Add(new ProductSize { ProductId = id, Label = s.Label, Price = s.Price, OldPrice = s.OldPrice, ImageUrl = s.ImageUrl });

        db.ProductPackagingOptions.RemoveRange(product.PackagingOptions);
        product.PackagingOptions.Clear();
        foreach (var p in request.PackagingOptions)
            product.PackagingOptions.Add(new ProductPackagingOption { ProductId = id, Type = p.Type, PriceDelta = p.PriceDelta });

        db.ProductStemOptions.RemoveRange(product.StemOptions);
        product.StemOptions.Clear();
        foreach (var s in request.StemOptions)
            product.StemOptions.Add(new ProductStemOption { ProductId = id, Count = s.Count, Price = s.Price });

        await db.SaveChangesAsync();

        var updated = await db.Products
            .Include(x => x.Sizes)
            .Include(x => x.Images)
            .Include(x => x.PackagingOptions)
            .Include(x => x.StemOptions)
            .AsNoTracking()
            .FirstAsync(x => x.Id == id);

        return updated.Adapt<ProductDto>();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return false;

        product.IsActive  = false;
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<ProductDto>> GetHitsAsync()
    {
        return await db.Products
            .Include(x => x.Sizes)
            .Include(x => x.Images)
            .Include(x => x.PackagingOptions)
            .Include(x => x.StemOptions)
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
            var oldPrimary = await db.ProductImages
                .Where(x => x.ProductId == productId && x.IsPrimary)
                .ToListAsync();
            foreach (var img in oldPrimary) img.IsPrimary = false;
        }

        db.ProductImages.Add(new ProductImage
        {
            ProductId = productId,
            Url       = imageUrl,
            IsPrimary = isPrimary,
        });

        await db.SaveChangesAsync();
        return imageUrl;
    }

    public async Task<bool> DeleteImageAsync(Guid productId, Guid imageId)
    {
        var image = await db.ProductImages
            .FirstOrDefaultAsync(x => x.Id == imageId && x.ProductId == productId);
        if (image is null) return false;

        db.ProductImages.Remove(image);
        await db.SaveChangesAsync();
        return true;
    }
}
