using System.Security.Claims;
using FlowerHouse.Application.DTOs.Auth;
using FlowerHouse.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfileController(IProfileService profileService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(await profileService.GetProfileAsync(GetUserId()));
    }

    [HttpPut]
    public async Task<IActionResult> Update(UpdateProfileRequest request)
    {
        await profileService.UpdateProfileAsync(GetUserId(), request);
        return NoContent();
    }

    [HttpPut("push-token")]
    public async Task<IActionResult> UpdatePushToken([FromBody] string pushToken)
    {
        await profileService.UpdatePushTokenAsync(GetUserId(), pushToken);
        return NoContent();
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}