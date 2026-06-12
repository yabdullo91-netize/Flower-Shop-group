using FlowerHouse.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/push")]
public class PushController(IProfileService profileService) : ControllerBase
{
    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] PushSubscriptionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
            return BadRequest("Push token is required.");

        await profileService.UpdatePushTokenAsync(GetUserId(), request.Token);
        return NoContent();
    }

    [HttpDelete("unsubscribe")]
    public async Task<IActionResult> Unsubscribe()
    {
        await profileService.UpdatePushTokenAsync(GetUserId(), null);
        return NoContent();
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}

public class PushSubscriptionRequest
{
    public string Token { get; set; } = string.Empty;
}
