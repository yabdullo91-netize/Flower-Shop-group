using FlowerHouse.Application.DTOs.Reviews;
using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using FlowerHouse.Domain.Enums;
using FlowerHouse.Infrastructure.Persistence;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlowerHouse.Application.Services;

public class ReviewService(AppDbContext db) : IReviewService
{
    public async Task<ReviewDto> CreateReviewAsync(Guid userId, CreateReviewRequest request)
    {
        // Check if order exists and belongs to the user
        var order = await db.Orders.FindAsync(request.OrderId);
        if (order is null || order.UserId != userId)
            throw new Exception("Order not found or access denied.");

        if (order.Status != Domain.Enums.OrderStatus.Delivered)
            throw new Exception("You can only review delivered orders.");

        var alreadyReviewed = await db.Reviews.AnyAsync(
            x => x.UserId == userId && x.OrderId == request.OrderId && x.ProductId == request.ProductId);
        if (alreadyReviewed)
            throw new Exception("You have already reviewed this product for this order.");

        var review = new Review
        {
            UserId = userId,
            ProductId = request.ProductId,
            OrderId = request.OrderId,
            Rating = request.Rating,
            Text = request.Text,
            Status = ReviewStatus.Pending,
            HelpfulCount = 0
        };

        foreach (var photoUrl in request.Photos)
        {
            review.Photos.Add(new ReviewPhoto
            {
                Url = photoUrl,
                SortOrder = 0
            });
        }

        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        return await GetReviewDtoAsync(review.Id);
    }

    public async Task<List<ReviewDto>> GetMyReviewsAsync(Guid userId)
    {
        return await db.Reviews
            .Include(x => x.Photos)
            .Include(x => x.User)
            .Include(x => x.Product)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new ReviewDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserName = x.User.Name ?? x.User.Phone,
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                OrderId = x.OrderId,
                Rating = x.Rating,
                Text = x.Text,
                Status = x.Status.ToString(),
                HelpfulCount = x.HelpfulCount,
                CreatedAt = x.CreatedAt,
                Photos = x.Photos.Select(p => new ReviewPhotoDto
                {
                    Id = p.Id,
                    Url = p.Url
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<List<ReviewDto>> GetProductReviewsAsync(Guid productId)
    {
        return await db.Reviews
            .Include(x => x.Photos)
            .Include(x => x.User)
            .Include(x => x.Product)
            .Where(x => x.ProductId == productId && x.Status == ReviewStatus.Approved)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new ReviewDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserName = x.User.Name ?? x.User.Phone,
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                OrderId = x.OrderId,
                Rating = x.Rating,
                Text = x.Text,
                Status = x.Status.ToString(),
                HelpfulCount = x.HelpfulCount,
                CreatedAt = x.CreatedAt,
                Photos = x.Photos.Select(p => new ReviewPhotoDto
                {
                    Id = p.Id,
                    Url = p.Url
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<List<ReviewDto>> GetPendingReviewsAsync()
    {
        return await db.Reviews
            .Include(x => x.Photos)
            .Include(x => x.User)
            .Include(x => x.Product)
            .Where(x => x.Status == ReviewStatus.Pending)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new ReviewDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserName = x.User.Name ?? x.User.Phone,
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                OrderId = x.OrderId,
                Rating = x.Rating,
                Text = x.Text,
                Status = x.Status.ToString(),
                HelpfulCount = x.HelpfulCount,
                CreatedAt = x.CreatedAt,
                Photos = x.Photos.Select(p => new ReviewPhotoDto
                {
                    Id = p.Id,
                    Url = p.Url
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task ApproveReviewAsync(Guid reviewId)
    {
        var review = await db.Reviews.FindAsync(reviewId);
        if (review is null)
            throw new Exception("Review not found.");

        review.Status = ReviewStatus.Approved;
        review.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        // Recalculate average rating of the product
        await RecalculateProductRatingAsync(review.ProductId);
    }

    public async Task RejectReviewAsync(Guid reviewId)
    {
        var review = await db.Reviews.FindAsync(reviewId);
        if (review is null)
            throw new Exception("Review not found.");

        review.Status = ReviewStatus.Rejected;
        review.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        // Recalculate average rating of the product in case it was previously approved
        await RecalculateProductRatingAsync(review.ProductId);
    }

    private async Task RecalculateProductRatingAsync(Guid productId)
    {
        var approvedReviews = await db.Reviews
            .Where(x => x.ProductId == productId && x.Status == ReviewStatus.Approved)
            .ToListAsync();

        var product = await db.Products.FindAsync(productId);
        if (product is not null)
        {
            product.ReviewCount = approvedReviews.Count;
            product.Rating = approvedReviews.Count > 0 ? (decimal)approvedReviews.Average(x => x.Rating) : 0;
            product.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }
    }

    private async Task<ReviewDto> GetReviewDtoAsync(Guid reviewId)
    {
        return await db.Reviews
            .Include(x => x.Photos)
            .Include(x => x.User)
            .Include(x => x.Product)
            .Where(x => x.Id == reviewId)
            .Select(x => new ReviewDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserName = x.User.Name ?? x.User.Phone,
                ProductId = x.ProductId,
                ProductName = x.Product.Name,
                OrderId = x.OrderId,
                Rating = x.Rating,
                Text = x.Text,
                Status = x.Status.ToString(),
                HelpfulCount = x.HelpfulCount,
                CreatedAt = x.CreatedAt,
                Photos = x.Photos.Select(p => new ReviewPhotoDto
                {
                    Id = p.Id,
                    Url = p.Url
                }).ToList()
            })
            .FirstAsync();
    }
}
