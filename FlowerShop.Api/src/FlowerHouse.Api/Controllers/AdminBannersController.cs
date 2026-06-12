using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize(Roles = "SuperAdmin")]
[Route("api/admin/banners")]
public class AdminBannersController(IContentService contentService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(Banner banner)
    {
        var result = await contentService.CreateBannerAsync(banner);
        return CreatedAtRoute(null, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, Banner banner)
    {
        var result = await contentService.UpdateBannerAsync(id, banner);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await contentService.DeleteBannerAsync(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
