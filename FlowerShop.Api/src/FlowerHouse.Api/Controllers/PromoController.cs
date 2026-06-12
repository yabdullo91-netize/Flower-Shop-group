using FlowerHouse.Application.DTOs.Orders;
using FlowerHouse.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Route("api/promo")]
public class PromoController(IPromoService promoService) : ControllerBase
{
    [HttpPost("validate")]
    public async Task<IActionResult> Validate(ValidatePromoRequest request)
    {
        return Ok(await promoService.ValidateAsync(request));
    }
}