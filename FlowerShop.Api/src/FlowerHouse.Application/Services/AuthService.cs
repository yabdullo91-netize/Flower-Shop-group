using FlowerHouse.Application.DTOs.Auth;
using FlowerHouse.Application.Interfaces;
using FlowerHouse.Domain.Entities;
using FlowerHouse.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlowerHouse.Application.Services;

public class AuthService(AppDbContext db, IJwtService jwtService) : IAuthService
{
    public async Task SendOtpAsync(SendOtpRequest request)
    {
        // Invalidate all previous unused OTPs for this phone to prevent accumulation
        var oldOtps = await db.OtpCodes
            .Where(x => x.Phone == request.Phone && !x.Used)
            .ToListAsync();
        foreach (var old in oldOtps)
            old.Used = true;

        var code = "111111"; // mock OTP for development
        var hash = BCrypt.Net.BCrypt.HashPassword(code);

        var otp = new OtpCode
        {
            Phone = request.Phone,
            CodeHash = hash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5)
        };

        db.OtpCodes.Add(otp);
        await db.SaveChangesAsync();
    }

    public async Task<AuthResponse> VerifyOtpAsync(VerifyOtpRequest request)
    {
        var otp = await db.OtpCodes
            .Where(x => x.Phone == request.Phone && !x.Used)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp is null)
            throw new Exception("OTP not found.");

        if (otp.ExpiresAt < DateTime.UtcNow)
            throw new Exception("OTP expired.");

        if (!BCrypt.Net.BCrypt.Verify(request.Code, otp.CodeHash))
        {
            otp.Attempts++;

            if (otp.Attempts >= 3)
                otp.Used = true;

            await db.SaveChangesAsync();
            throw new Exception("Invalid OTP.");
        }

        otp.Used = true;

        var user = await db.Users.FirstOrDefaultAsync(x => x.Phone == request.Phone);

        if (user is null)
        {
            user = new User
            {
                Phone = request.Phone
            };

            db.Users.Add(user);
        }

        var accessToken = jwtService.GenerateAccessToken(user);
        var refreshTokenValue = jwtService.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            User = user,
            Token = refreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            UserId = user.Id,
            Phone = user.Phone,
            Name = user.Name,
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var storedToken = await db.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token == request.RefreshToken);

        if (storedToken is null)
            throw new Exception("Invalid refresh token.");

        if (storedToken.Revoked || storedToken.ExpiresAt < DateTime.UtcNow)
            throw new Exception("Expired or revoked refresh token.");

        storedToken.Revoked = true;
        storedToken.UpdatedAt = DateTime.UtcNow;

        var user = storedToken.User;
        var newAccessToken = jwtService.GenerateAccessToken(user);
        var newRefreshTokenValue = jwtService.GenerateRefreshToken();

        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            User = user,
            Token = newRefreshTokenValue,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        db.RefreshTokens.Add(newRefreshToken);
        await db.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshTokenValue,
            UserId = user.Id,
            Phone = user.Phone,
            Name = user.Name,
            Role = user.Role.ToString()
        };
    }

    public async Task LogoutAsync(string refreshTokenValue)
    {
        var storedToken = await db.RefreshTokens
            .FirstOrDefaultAsync(x => x.Token == refreshTokenValue);

        if (storedToken is not null)
        {
            storedToken.Revoked = true;
            storedToken.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }
    }

    public async Task RegisterAsync(RegisterRequest request)
    {
        var exists = await db.Users.AnyAsync(x => x.Phone == request.Phone);
        if (exists)
            throw new Exception("User already registered. Please login.");

        var user = new User
        {
            Phone = request.Phone,
            Name = request.Name,
            Role = "Customer",
            IsBlocked = false
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        // Send OTP
        await SendOtpAsync(new SendOtpRequest { Phone = request.Phone });
    }

    public async Task LoginAsync(LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Phone == request.Phone && x.Name == request.Name);
        if (user is null)
            throw new Exception("User not registered or name/phone do not match.");

        if (user.IsBlocked)
            throw new Exception("User account is blocked.");

        // Send OTP
        await SendOtpAsync(new SendOtpRequest { Phone = request.Phone });
    }
}