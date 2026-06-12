using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Common;
using FlowerHouse.Admin.Models.Loyalty;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис программы лояльности — бонусные счета, история транзакций, корректировка баллов.
/// </summary>
public class LoyaltyService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить список бонусных аккаунтов с пагинацией и поиском.
    /// </summary>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <param name="search">Поиск по имени или телефону.</param>
    /// <returns>Постраничный результат с бонусными аккаунтами.</returns>
    public async Task<PagedResult<LoyaltyAccountDto>> GetAccountsAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null)
    {
        try
        {
            var query = $"api/loyalty/admin/accounts?page={page}&pageSize={pageSize}";

            if (!string.IsNullOrWhiteSpace(search))
                query += $"&search={Uri.EscapeDataString(search)}";

            return await _http.GetFromJsonAsync<PagedResult<LoyaltyAccountDto>>(query) ?? new();
        }
        catch
        {
            return new();
        }
    }

    /// <summary>
    /// Получить историю бонусных транзакций пользователя.
    /// </summary>
    /// <param name="userId">Идентификатор пользователя.</param>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <returns>Постраничный результат с транзакциями.</returns>
    public async Task<PagedResult<LoyaltyTransactionDto>> GetHistoryAsync(
        int userId,
        int page = 1,
        int pageSize = 20)
    {
        try
        {
            return await _http.GetFromJsonAsync<PagedResult<LoyaltyTransactionDto>>(
                $"api/loyalty/admin/{userId}/history?page={page}&pageSize={pageSize}") ?? new();
        }
        catch
        {
            return new();
        }
    }

    /// <summary>
    /// Вручную скорректировать бонусные баллы пользователя.
    /// </summary>
    /// <param name="request">Запрос с данными корректировки.</param>
    /// <returns>true, если баллы успешно скорректированы.</returns>
    public async Task<bool> AdjustPointsAsync(AdjustPointsRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/loyalty/admin/adjust", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
