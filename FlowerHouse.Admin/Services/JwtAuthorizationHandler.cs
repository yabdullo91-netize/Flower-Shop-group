using System.Net;
using System.Net.Http.Headers;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// HTTP-перехватчик: добавляет JWT токен к каждому запросу.
/// При получении 401 — инициирует logout.
/// </summary>
public class JwtAuthorizationHandler : DelegatingHandler
{
    private readonly LocalStorageService _localStorage;

    // Нельзя инжектить JwtAuthStateProvider напрямую — будет циклическая зависимость
    // Поэтому используем localStorage напрямую
    public JwtAuthorizationHandler(LocalStorageService localStorage)
    {
        _localStorage = localStorage;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        // Не добавляем токен к auth-запросам
        var path = request.RequestUri?.PathAndQuery ?? "";
        if (!path.Contains("/auth/"))
        {
            var token = await _localStorage.GetItemAsync("fh_access_token");
            if (!string.IsNullOrWhiteSpace(token))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }

        var response = await base.SendAsync(request, cancellationToken);

        // При 401 — токен истёк или недействителен
        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            // TODO: Попытка refresh, если не получится — logout
            await _localStorage.RemoveItemAsync("fh_access_token");
            await _localStorage.RemoveItemAsync("fh_refresh_token");
        }

        return response;
    }
}
