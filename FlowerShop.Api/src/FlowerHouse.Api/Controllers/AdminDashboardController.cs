using FlowerHouse.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/admin/dashboard")]
public class AdminDashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalRevenue = await db.Orders
            .Where(x => x.Status != FlowerHouse.Domain.Enums.OrderStatus.Cancelled)
            .SumAsync(x => x.Total);

        var ordersCount = await db.Orders.CountAsync();
        var activeUsersCount = await db.Users.CountAsync();
        var pendingReviewsCount = await db.Reviews
            .Where(x => x.Status == FlowerHouse.Domain.Enums.ReviewStatus.Pending)
            .CountAsync();

        return Ok(new
        {
            totalRevenue,
            ordersCount,
            activeUsersCount,
            pendingReviewsCount
        });
    }

    [HttpGet("orders-chart")]
    public async Task<IActionResult> GetOrdersChart()
    {
        var startDate = DateTime.UtcNow.Date.AddDays(-6);

        var orders = await db.Orders
            .Where(x => x.CreatedAt >= startDate)
            .ToListAsync();

        var chartData = Enumerable.Range(0, 7)
            .Select(offset => startDate.AddDays(offset))
            .Select(date => new
            {
                Date = date.ToString("yyyy-MM-dd"),
                Count = orders.Count(o => o.CreatedAt.Date == date),
                Revenue = orders.Where(o => o.CreatedAt.Date == date && o.Status != FlowerHouse.Domain.Enums.OrderStatus.Cancelled).Sum(o => o.Total)
            })
            .ToList();

        return Ok(chartData);
    }
}
