using FlowerHouse.Domain.Entities;
using FlowerHouse.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Authorize(Roles = "SuperAdmin")]
[Route("api/admin/users")]
public class AdminUsersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await db.Users
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound();

        return Ok(user);
    }

    [HttpPatch("{id:guid}/block")]
    public async Task<IActionResult> Block(Guid id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound();

        user.IsBlocked = !user.IsBlocked;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/role")]
    public async Task<IActionResult> ChangeRole(Guid id, [FromBody] string role)
    {
        if (role != "Customer" && role != "Admin" && role != "SuperAdmin")
            return BadRequest("Invalid role. Role must be Customer, Admin, or SuperAdmin.");

        var user = await db.Users.FindAsync(id);
        if (user is null)
            return NotFound();

        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost]
    public async Task<IActionResult> CreateAdmin(CreateAdminRequest request)
    {
        var exists = await db.Users.AnyAsync(x => x.Phone == request.Phone);
        if (exists)
            return BadRequest("Phone number already exists.");

        var admin = new User
        {
            Phone = request.Phone,
            Name = request.Name,
            Role = "Admin"
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = admin.Id }, admin);
    }
}

public class CreateAdminRequest
{
    public string Phone { get; set; } = string.Empty;
    public string? Name { get; set; }
}
