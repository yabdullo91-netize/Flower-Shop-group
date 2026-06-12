using FlowerHouse.Application.DTOs.Loyalty;
using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using FlowerHouse.Infrastructure.Persistence;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlowerHouse.Application.Services;

public class LoyaltyService(AppDbContext db) : ILoyaltyService
{
    public async Task<LoyaltyBalanceDto> GetBalanceAsync(Guid userId)
    {
        var account = await db.LoyaltyAccounts
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (account is null)
        {
            account = new LoyaltyAccount
            {
                UserId = userId,
                Points = 0,
                TotalEarned = 0,
                Tier = "Bronze"
            };
            db.LoyaltyAccounts.Add(account);
            await db.SaveChangesAsync();
        }

        return account.Adapt<LoyaltyBalanceDto>();
    }

    public async Task<List<LoyaltyTransactionDto>> GetHistoryAsync(Guid userId)
    {
        return await db.LoyaltyTransactions
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectToType<LoyaltyTransactionDto>()
            .ToListAsync();
    }

    public async Task AdjustPointsAsync(AdjustPointsRequest request)
    {
        var userExists = await db.Users.AnyAsync(u => u.Id == request.UserId);
        if (!userExists)
            throw new Exception("User not found.");

        var account = await db.LoyaltyAccounts
            .FirstOrDefaultAsync(x => x.UserId == request.UserId);

        if (account is null)
        {
            account = new LoyaltyAccount
            {
                UserId = request.UserId,
                Points = 0,
                TotalEarned = 0,
                Tier = "Bronze"
            };
            db.LoyaltyAccounts.Add(account);
        }

        account.Points += request.Points;
        account.UpdatedAt = DateTime.UtcNow;

        if (request.Points > 0)
        {
            account.TotalEarned += request.Points;

            // Recalculate Tier
            if (account.TotalEarned >= 1000)
                account.Tier = "Gold";
            else if (account.TotalEarned >= 500)
                account.Tier = "Silver";
            else
                account.Tier = "Bronze";
        }

        db.LoyaltyTransactions.Add(new LoyaltyTransaction
        {
            UserId = request.UserId,
            Type = "Adjustment",
            Points = request.Points,
            Description = request.Description
        });

        await db.SaveChangesAsync();
    }
}
