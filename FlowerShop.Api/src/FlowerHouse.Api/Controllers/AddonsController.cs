using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Route("api/addons")]
public class AddonsController(IContentService contentService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get()
    {
        return Ok(await contentService.GetAddonsAsync());
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Create(Addon addon)
    {
        var result = await contentService.CreateAddonAsync(addon);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, Addon addon)
    {
        var result = await contentService.UpdateAddonAsync(id, addon);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await contentService.DeleteAddonAsync(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
