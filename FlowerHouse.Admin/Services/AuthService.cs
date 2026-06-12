using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Auth;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис аутентификации — отправка OTP, верификация, обновление токенов и выход.
/// </summary>
public class AuthService(HttpClient http, JwtAuthStateProvider authStateProvider)
{
    private readonly HttpClient _http = http;
    private readonly JwtAuthStateProvider _authStateProvider = authStateProvider;

    /// <summary>
    /// Отправить OTP-код на указанный номер телефона.
    /// </summary>
    /// <param name="request">Запрос с номером телефона.</param>
    /// <returns>true, если код успешно отправлен.</returns>
    public async Task<bool> SendOtpAsync(SendOtpRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/auth/send-otp", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Проверить OTP-код и получить токены авторизации.
    /// </summary>
    /// <param name="request">Запрос с номером телефона и кодом.</param>
    /// <returns>Ответ с токенами или null при ошибке.</returns>
    public async Task<AuthResponse?> VerifyOtpAsync(VerifyOtpRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/auth/verify-otp", request);

            if (!response.IsSuccessStatusCode)
                return null;

            var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();

            if (authResponse is not null)
            {
                await _authStateProvider.MarkUserAsAuthenticated(
                    authResponse.AccessToken,
                    authResponse.RefreshToken);
            }

            return authResponse;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Обновить access-токен с помощью refresh-токена.
    /// </summary>
    /// <param name="refreshToken">Текущий refresh-токен.</param>
    /// <returns>Новые токены или null при ошибке.</returns>
    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/auth/refresh", new { RefreshToken = refreshToken });

            if (!response.IsSuccessStatusCode)
                return null;

            var authResponse = await response.Content.ReadFromJsonAsync<AuthResponse>();

            if (authResponse is not null)
            {
                await _authStateProvider.MarkUserAsAuthenticated(
                    authResponse.AccessToken,
                    authResponse.RefreshToken);
            }

            return authResponse;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Выйти из системы — очистить токены и уведомить провайдер состояния.
    /// </summary>
    public async Task LogoutAsync()
    {
        try
        {
            await _http.PostAsync("api/auth/logout", null);
        }
        catch
        {
            // Игнорируем ошибку сети при выходе
        }
        finally
        {
            await _authStateProvider.MarkUserAsLoggedOut();
        }
    }
}
