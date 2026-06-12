using FlowerHouse.Application.DTOs.Orders;
using FlowerHouse.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        var order = await orderService.CreateOrderAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetMyOrderById), new { id = order.Id }, order);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyOrders()
    {
        var orders = await orderService.GetMyOrdersAsync(GetUserId());
        return Ok(orders);
    }

    [HttpGet("my/{id:guid}")]
    public async Task<IActionResult> GetMyOrderById(Guid id)
    {
        var order = await orderService.GetMyOrderByIdAsync(GetUserId(), id);
        if (order is null)
            return NotFound();

        return Ok(order);
    }

    [HttpPatch("my/{id:guid}/cancel")]
    public async Task<IActionResult> CancelMyOrder(Guid id)
    {
        var success = await orderService.CancelMyOrderAsync(GetUserId(), id);
        if (!success)
            return BadRequest("Cannot cancel this order.");

        return NoContent();
    }

    [HttpGet]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetAllOrders([FromQuery] string? status, [FromQuery] Guid? userId)
    {
        var orders = await orderService.GetAllOrdersAsync(status, userId);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var order = await orderService.GetOrderByIdAsync(id);
        if (order is null)
            return NotFound();

        return Ok(order);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromQuery] string status, [FromQuery] string? comment)
    {
        var success = await orderService.UpdateOrderStatusAsync(id, status, comment, GetUserId());
        if (!success)
            return BadRequest("Failed to update status.");

        return NoContent();
    }

    [HttpPost("{id:guid}/photo")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> UploadOrderPhoto(Guid id, IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file uploaded.");

        using var stream = file.OpenReadStream();
        var photoUrl = await orderService.UploadOrderPhotoAsync(id, stream, file.FileName);
        return Ok(new { url = photoUrl });
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}
