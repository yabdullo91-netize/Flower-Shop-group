using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Провайдер состояния аутентификации на основе JWT из localStorage.
/// Парсит claims из JWT-токена и предоставляет AuthenticationState.
/// </summary>
public class JwtAuthStateProvider : AuthenticationStateProvider
{
    private readonly LocalStorageService _localStorage;
    private readonly ClaimsPrincipal _anonymous = new(new ClaimsIdentity());

    private const string TokenKey = "fh_access_token";
    private const string RefreshTokenKey = "fh_refresh_token";

    public JwtAuthStateProvider(LocalStorageService localStorage)
    {
        _localStorage = localStorage;
    }

    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        try
        {
            var token = await _localStorage.GetItemAsync(TokenKey);

            if (string.IsNullOrWhiteSpace(token))
                return new AuthenticationState(_anonymous);

            var handler = new JwtSecurityTokenHandler();

            if (!handler.CanReadToken(token))
                return new AuthenticationState(_anonymous);

            var jwt = handler.ReadJwtToken(token);

            // Проверяем срок действия
            if (jwt.ValidTo < DateTime.UtcNow)
            {
                await MarkUserAsLoggedOut();
                return new AuthenticationState(_anonymous);
            }

            var claims = jwt.Claims.ToList();

            // Нормализуем claim для роли (поддержка разных форматов JWT)
            var roleClaim = claims.FirstOrDefault(c =>
                c.Type == "role" ||
                c.Type == ClaimTypes.Role ||
                c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role");

            if (roleClaim != null && roleClaim.Type != ClaimTypes.Role)
            {
                claims.Add(new Claim(ClaimTypes.Role, roleClaim.Value));
            }

            // Нормализуем name claim
            var nameClaim = claims.FirstOrDefault(c =>
                c.Type == "name" ||
                c.Type == ClaimTypes.Name ||
                c.Type == "unique_name");

            if (nameClaim != null && nameClaim.Type != ClaimTypes.Name)
            {
                claims.Add(new Claim(ClaimTypes.Name, nameClaim.Value));
            }

            var identity = new ClaimsIdentity(claims, "jwt");
            var user = new ClaimsPrincipal(identity);

            return new AuthenticationState(user);
        }
        catch
        {
            return new AuthenticationState(_anonymous);
        }
    }

    /// <summary>
    /// Вызывается после успешного входа — сохраняет токены и обновляет состояние.
    /// </summary>
    public async Task MarkUserAsAuthenticated(string accessToken, string refreshToken)
    {
        await _localStorage.SetItemAsync(TokenKey, accessToken);
        await _localStorage.SetItemAsync(RefreshTokenKey, refreshToken);

        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }

    /// <summary>
    /// Вызывается при выходе — очищает токены и обновляет состояние.
    /// </summary>
    public async Task MarkUserAsLoggedOut()
    {
        await _localStorage.RemoveItemAsync(TokenKey);
        await _localStorage.RemoveItemAsync(RefreshTokenKey);

        NotifyAuthenticationStateChanged(
            Task.FromResult(new AuthenticationState(_anonymous)));
    }

    /// <summary>
    /// Получить текущий access token.
    /// </summary>
    public async Task<string?> GetTokenAsync()
    {
        return await _localStorage.GetItemAsync(TokenKey);
    }

    /// <summary>
    /// Получить текущий refresh token.
    /// </summary>
    public async Task<string?> GetRefreshTokenAsync()
    {
        return await _localStorage.GetItemAsync(RefreshTokenKey);
    }

    /// <summary>
    /// Получить роль текущего пользователя.
    /// </summary>
    public async Task<string?> GetUserRoleAsync()
    {
        var state = await GetAuthenticationStateAsync();
        return state.User.FindFirst(ClaimTypes.Role)?.Value;
    }
}
