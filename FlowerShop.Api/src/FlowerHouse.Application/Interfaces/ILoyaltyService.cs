using FlowerHouse.Application.DTOs.Loyalty;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FlowerHouse.Application.Interfaces;

public interface ILoyaltyService
{
    Task<LoyaltyBalanceDto> GetBalanceAsync(Guid userId);
    Task<List<LoyaltyTransactionDto>> GetHistoryAsync(Guid userId);
    Task AdjustPointsAsync(AdjustPointsRequest request);
}
