using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/admin/delivery/slots")]
public class AdminDeliveryController(IContentService contentService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(DeliveryTimeSlot slot)
    {
        var result = await contentService.CreateDeliverySlotAsync(slot);
        return CreatedAtRoute(null, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, DeliveryTimeSlot slot)
    {
        var result = await contentService.UpdateDeliverySlotAsync(id, slot);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await contentService.DeleteDeliverySlotAsync(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
