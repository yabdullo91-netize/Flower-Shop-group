using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Common;
using FlowerHouse.Admin.Models.Settings;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис системных настроек и аудит-лога.
/// </summary>
public class SettingsService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить текущие системные настройки.
    /// </summary>
    /// <returns>Настройки или null при ошибке.</returns>
    public async Task<SystemSettingsDto?> GetSettingsAsync()
    {
        try
        {
            return await _http.GetFromJsonAsync<SystemSettingsDto>("api/admin/settings");
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Обновить системные настройки.
    /// </summary>
    /// <param name="settings">Обновлённые настройки.</param>
    /// <returns>true, если настройки успешно сохранены.</returns>
    public async Task<bool> UpdateSettingsAsync(SystemSettingsDto settings)
    {
        try
        {
            var response = await _http.PutAsJsonAsync("api/admin/settings", settings);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Получить записи аудит-лога с пагинацией и фильтрацией.
    /// </summary>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <param name="from">Начальная дата.</param>
    /// <param name="to">Конечная дата.</param>
    /// <param name="search">Поиск по действию или имени пользователя.</param>
    /// <returns>Постраничный результат с записями аудит-лога.</returns>
    public async Task<PagedResult<AuditLogDto>> GetAuditLogAsync(
        int page = 1,
        int pageSize = 50,
        DateTime? from = null,
        DateTime? to = null,
        string? search = null)
    {
        try
        {
            var query = $"api/admin/audit-log?page={page}&pageSize={pageSize}";

            if (from.HasValue)
                query += $"&from={from.Value:yyyy-MM-dd}";

            if (to.HasValue)
                query += $"&to={to.Value:yyyy-MM-dd}";

            if (!string.IsNullOrWhiteSpace(search))
                query += $"&search={Uri.EscapeDataString(search)}";

            return await _http.GetFromJsonAsync<PagedResult<AuditLogDto>>(query) ?? new();
        }
        catch
        {
            return new();
        }
    }
}
