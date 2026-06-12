using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Delivery;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис управления временными слотами доставки — CRUD операции.
/// </summary>
public class DeliveryService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить список всех временных слотов доставки.
    /// </summary>
    /// <returns>Список слотов.</returns>
    public async Task<List<TimeSlotDto>> GetSlotsAsync()
    {
        try
        {
            return await _http.GetFromJsonAsync<List<TimeSlotDto>>("api/admin/delivery/slots") ?? [];
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// Создать новый временной слот.
    /// </summary>
    /// <param name="request">Данные нового слота.</param>
    /// <returns>true, если слот успешно создан.</returns>
    public async Task<bool> CreateAsync(TimeSlotCreateRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/admin/delivery/slots", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Обновить существующий временной слот.
    /// </summary>
    /// <param name="id">Идентификатор слота.</param>
    /// <param name="request">Обновлённые данные.</param>
    /// <returns>true, если слот успешно обновлён.</returns>
    public async Task<bool> UpdateAsync(int id, TimeSlotCreateRequest request)
    {
        try
        {
            var response = await _http.PutAsJsonAsync($"api/admin/delivery/slots/{id}", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Удалить временной слот.
    /// </summary>
    /// <param name="id">Идентификатор слота.</param>
    /// <returns>true, если слот успешно удалён.</returns>
    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            var response = await _http.DeleteAsync($"api/admin/delivery/slots/{id}");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
