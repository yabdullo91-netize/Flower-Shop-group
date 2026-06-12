using FlowerHouse.Application.DTOs.Auth;

namespace FlowerHouse.Application.Interfaces;

public interface IProfileService
{
    Task<object> GetProfileAsync(Guid userId);
    Task UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task UpdatePushTokenAsync(Guid userId, string pushToken);
}