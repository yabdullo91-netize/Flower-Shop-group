using System.Security.Claims;
using FlowerHouse.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/favorites")]
public class FavoritesController(IFavoriteService favoriteService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = GetUserId();
        return Ok(await favoriteService.GetMyFavoritesAsync(userId));
    }

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> Add(Guid productId)
    {
        await favoriteService.AddAsync(GetUserId(), productId);
        return NoContent();
    }

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> Remove(Guid productId)
    {
        await favoriteService.RemoveAsync(GetUserId(), productId);
        return NoContent();
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}