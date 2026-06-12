using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Route("api/message-templates")]
public class MessageTemplatesController(IContentService contentService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get()
    {
        return Ok(await contentService.GetMessageTemplatesAsync());
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Create(MessageTemplate template)
    {
        var result = await contentService.CreateMessageTemplateAsync(template);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, MessageTemplate template)
    {
        var result = await contentService.UpdateMessageTemplateAsync(id, template);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await contentService.DeleteMessageTemplateAsync(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
