using FlowerHouse.Application.DTOs.Auth;
using FlowerHouse.Application.Interfaces;
using FlowerHouse.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlowerHouse.Application.Services;

public class ProfileService(AppDbContext db) : IProfileService
{
    public async Task<object> GetProfileAsync(Guid userId)
    {
        var user = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user is null)
            throw new Exception("User not found.");

        return new
        {
            user.Id,
            user.Phone,
            user.Name,
            Role = user.Role.ToString(),
            user.IsBlocked
        };
    }

    public async Task UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await db.Users.FindAsync(userId);

        if (user is null)
            throw new Exception("User not found.");

        user.Name = request.Name;
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
    }

    public async Task UpdatePushTokenAsync(Guid userId, string pushToken)
    {
        var user = await db.Users.FindAsync(userId);

        if (user is null)
            throw new Exception("User not found.");

        user.PushToken = pushToken;
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
    }
}