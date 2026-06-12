using FlowerHouse.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlowerHouse.Api.Controllers;

[ApiController]
public class ContentController(IContentService contentService) : ControllerBase
{
    [HttpGet("api/content/banners")]
    public async Task<IActionResult> GetBanners()
    {
        return Ok(await contentService.GetBannersAsync());
    }

    [HttpGet("api/delivery/slots")]
    public async Task<IActionResult> GetDeliverySlots()
    {
        return Ok(await contentService.GetDeliverySlotsAsync());
    }
}