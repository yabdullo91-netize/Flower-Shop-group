using FlowerHouse.Application.DTOs.Loyalty;
using FlowerHouse.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/loyalty")]
public class LoyaltyController(ILoyaltyService loyaltyService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetBalance()
    {
        var balance = await loyaltyService.GetBalanceAsync(GetUserId());
        return Ok(balance);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var history = await loyaltyService.GetHistoryAsync(GetUserId());
        return Ok(history);
    }

    [HttpPost("admin/adjust")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> AdjustPoints(AdjustPointsRequest request)
    {
        await loyaltyService.AdjustPointsAsync(request);
        return NoContent();
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}
