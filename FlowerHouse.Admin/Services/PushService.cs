using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Push;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис отправки push-уведомлений — массовая рассылка.
/// </summary>
public class PushService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Отправить push-уведомление всем подписанным пользователям.
    /// </summary>
    /// <param name="request">Данные уведомления (заголовок, текст, ссылка).</param>
    /// <returns>true, если уведомление успешно отправлено.</returns>
    public async Task<bool> SendBroadcastAsync(PushSendRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/admin/push/send", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
