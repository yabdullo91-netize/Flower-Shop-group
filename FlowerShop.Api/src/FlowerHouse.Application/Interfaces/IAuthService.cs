using FlowerHouse.Application.DTOs.Auth;

namespace FlowerHouse.Application.Interfaces;

public interface IAuthService
{
    Task SendOtpAsync(SendOtpRequest request);
    Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
    Task LogoutAsync(string refreshTokenValue);
    Task RegisterAsync(RegisterRequest request);
    Task LoginAsync(LoginRequest request);
}