using FlowerHouse.Application.DTOs.Auth;
using FlowerHouse.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FlowerHouse.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp(SendOtpRequest request)
    {
        await authService.SendOtpAsync(request);
        return Ok(new { message = "OTP sent. Development code is 111111" });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp(VerifyOtpRequest request)
    {
        var result = await authService.VerifyOtpAsync(request);
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshTokenRequest request)
    {
        var result = await authService.RefreshTokenAsync(request);
        return Ok(result);
    }

    [HttpPost("logout")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Logout(RefreshTokenRequest request)
    {
        await authService.LogoutAsync(request.RefreshToken);
        return NoContent();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        await authService.RegisterAsync(request);
        return Ok(new { message = "Registration successful. OTP sent. Development code is 111111" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        await authService.LoginAsync(request);
        return Ok(new { message = "Login initiated. OTP sent. Development code is 111111" });
    }
}