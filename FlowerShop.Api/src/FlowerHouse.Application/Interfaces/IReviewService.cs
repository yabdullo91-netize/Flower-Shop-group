using FlowerHouse.Application.DTOs.Reviews;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FlowerHouse.Application.Interfaces;

public interface IReviewService
{
    Task<ReviewDto> CreateReviewAsync(Guid userId, CreateReviewRequest request);
    Task<List<ReviewDto>> GetMyReviewsAsync(Guid userId);
    Task<List<ReviewDto>> GetProductReviewsAsync(Guid productId);
    Task<List<ReviewDto>> GetPendingReviewsAsync();
    Task ApproveReviewAsync(Guid reviewId);
    Task RejectReviewAsync(Guid reviewId);
}
