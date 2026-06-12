using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Common;
using FlowerHouse.Admin.Models.Orders;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис управления заказами — получение, фильтрация, обновление статуса, загрузка фото.
/// </summary>
public class OrderService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить список заказов с фильтрацией и пагинацией.
    /// </summary>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <param name="status">Фильтр по статусу.</param>
    /// <param name="search">Поиск по номеру заказа, имени или телефону.</param>
    /// <param name="from">Начальная дата.</param>
    /// <param name="to">Конечная дата.</param>
    /// <returns>Постраничный результат с заказами.</returns>
    public async Task<PagedResult<OrderDto>> GetOrdersAsync(
        int page = 1,
        int pageSize = 20,
        string? status = null,
        string? search = null,
        DateTime? from = null,
        DateTime? to = null)
    {
        try
        {
            var query = $"api/orders?page={page}&pageSize={pageSize}";

            if (!string.IsNullOrWhiteSpace(status))
                query += $"&status={Uri.EscapeDataString(status)}";

            if (!string.IsNullOrWhiteSpace(search))
                query += $"&search={Uri.EscapeDataString(search)}";

            if (from.HasValue)
                query += $"&from={from.Value:yyyy-MM-dd}";

            if (to.HasValue)
                query += $"&to={to.Value:yyyy-MM-dd}";

            return await _http.GetFromJsonAsync<PagedResult<OrderDto>>(query) ?? new();
        }
        catch
        {
            return new();
        }
    }

    /// <summary>
    /// Получить заказ по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор заказа.</param>
    /// <returns>Заказ или null, если не найден.</returns>
    public async Task<OrderDto?> GetOrderAsync(int id)
    {
        try
        {
            return await _http.GetFromJsonAsync<OrderDto>($"api/orders/{id}");
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Обновить статус заказа.
    /// </summary>
    /// <param name="id">Идентификатор заказа.</param>
    /// <param name="request">Новый статус и комментарий.</param>
    /// <returns>true, если статус успешно обновлён.</returns>
    public async Task<bool> UpdateStatusAsync(int id, OrderStatusUpdateRequest request)
    {
        try
        {
            var response = await _http.PatchAsJsonAsync($"api/orders/{id}/status", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Загрузить фото доставленного заказа.
    /// </summary>
    /// <param name="id">Идентификатор заказа.</param>
    /// <param name="content">Содержимое формы с файлом.</param>
    /// <returns>true, если фото успешно загружено.</returns>
    public async Task<bool> UploadPhotoAsync(int id, MultipartFormDataContent content)
    {
        try
        {
            var response = await _http.PostAsync($"api/orders/{id}/photo", content);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
