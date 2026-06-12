using FlowerHouse.Application.DTOs.Reviews;
using FlowerHouse.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/reviews")]
public class ReviewsController(IReviewService reviewService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateReviewRequest request)
    {
        var review = await reviewService.CreateReviewAsync(GetUserId(), request);
        return Ok(review);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyReviews()
    {
        var reviews = await reviewService.GetMyReviewsAsync(GetUserId());
        return Ok(reviews);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetPendingReviews()
    {
        var reviews = await reviewService.GetPendingReviewsAsync();
        return Ok(reviews);
    }

    [HttpPatch("{id:guid}/approve")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Approve(Guid id)
    {
        await reviewService.ApproveReviewAsync(id);
        return NoContent();
    }

    [HttpPatch("{id:guid}/reject")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Reject(Guid id)
    {
        await reviewService.RejectReviewAsync(id);
        return NoContent();
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}
