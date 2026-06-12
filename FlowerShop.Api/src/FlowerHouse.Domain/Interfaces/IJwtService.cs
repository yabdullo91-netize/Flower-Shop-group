using FlowerHouse.Domain.Entities;

namespace FlowerHouse.Domain.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
