using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Addons;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис управления дополнениями (аддонами) к заказам — CRUD операции.
/// </summary>
public class AddonService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить список всех дополнений.
    /// </summary>
    /// <returns>Список дополнений.</returns>
    public async Task<List<AddonDto>> GetAddonsAsync()
    {
        try
        {
            return await _http.GetFromJsonAsync<List<AddonDto>>("api/addons") ?? [];
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// Создать новое дополнение.
    /// </summary>
    /// <param name="request">Данные нового дополнения.</param>
    /// <returns>true, если дополнение успешно создано.</returns>
    public async Task<bool> CreateAsync(AddonCreateRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/addons", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Обновить существующее дополнение.
    /// </summary>
    /// <param name="id">Идентификатор дополнения.</param>
    /// <param name="request">Обновлённые данные.</param>
    /// <returns>true, если дополнение успешно обновлено.</returns>
    public async Task<bool> UpdateAsync(int id, AddonCreateRequest request)
    {
        try
        {
            var response = await _http.PutAsJsonAsync($"api/addons/{id}", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Удалить дополнение.
    /// </summary>
    /// <param name="id">Идентификатор дополнения.</param>
    /// <returns>true, если дополнение успешно удалено.</returns>
    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            var response = await _http.DeleteAsync($"api/addons/{id}");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
