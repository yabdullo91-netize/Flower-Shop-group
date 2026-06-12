using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Route("api/postcards")]
public class PostcardsController(IContentService contentService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get()
    {
        return Ok(await contentService.GetPostcardsAsync());
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Create(Postcard postcard)
    {
        var result = await contentService.CreatePostcardAsync(postcard);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, Postcard postcard)
    {
        var result = await contentService.UpdatePostcardAsync(id, postcard);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await contentService.DeletePostcardAsync(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
