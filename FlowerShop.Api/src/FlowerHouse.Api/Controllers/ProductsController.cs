using FlowerHouse.Application.DTOs.Products;
using FlowerHouse.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(IProductService productService, IReviewService reviewService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? q,
        [FromQuery] string? occasion,
        [FromQuery] string? freshness,
        [FromQuery] string? kind,
        [FromQuery] string? packaging,
        [FromQuery] decimal? priceMin,
        [FromQuery] decimal? priceMax,
        [FromQuery] bool? deliverToday,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var result = await productService.GetAllAsync(
            q,
            occasion,
            freshness,
            kind,
            packaging,
            priceMin,
            priceMax,
            deliverToday,
            sort,
            page,
            pageSize);

        return Ok(result);
    }

    [HttpGet("hits")]
    [AllowAnonymous]
    public async Task<IActionResult> GetHits()
    {
        var hits = await productService.GetHitsAsync();
        return Ok(hits);
    }

    [HttpGet("{slug}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var product = await productService.GetBySlugAsync(slug);

        if (product is null)
            return NotFound();

        return Ok(product);
    }

    [HttpGet("{id:guid}/reviews")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReviews(Guid id)
    {
        var reviews = await reviewService.GetProductReviewsAsync(id);
        return Ok(reviews);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Create(CreateProductRequest request)
    {
        var product = await productService.CreateAsync(request);
        return CreatedAtAction(nameof(GetBySlug), new { slug = product.Slug }, product);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, CreateProductRequest request)
    {
        var product = await productService.UpdateAsync(id, request);
        return Ok(product);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await productService.DeleteAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id:guid}/images")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file, [FromQuery] bool isPrimary = false)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file uploaded.");

        using var stream = file.OpenReadStream();
        var imageUrl = await productService.AddImageAsync(id, stream, file.FileName, isPrimary);
        return Ok(new { url = imageUrl });
    }

    [HttpDelete("{id:guid}/images/{imgId:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> DeleteImage(Guid id, Guid imgId)
    {
        var deleted = await productService.DeleteImageAsync(id, imgId);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}