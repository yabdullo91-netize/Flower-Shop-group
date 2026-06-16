using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Common;
using FlowerHouse.Admin.Models.Reviews;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис модерации отзывов — получение, одобрение и отклонение отзывов.
/// </summary>
public class ReviewService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить список отзывов с пагинацией и фильтрацией по статусу.
    /// </summary>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <param name="status">Фильтр по статусу модерации (Pending, Approved, Rejected).</param>
    /// <returns>Постраничный результат с отзывами.</returns>
    public async Task<PagedResult<ReviewDto>> GetReviewsAsync(
        int page = 1,
        int pageSize = 20,
        string? status = null)
    {
        try
        {
            var query = $"api/reviews?page={page}&pageSize={pageSize}";

            if (!string.IsNullOrWhiteSpace(status))
                query += $"&status={Uri.EscapeDataString(status)}";

            return await _http.GetFromJsonAsync<PagedResult<ReviewDto>>(query) ?? new();
        }
        catch
        {
            return new();
        }
    }

    /// <summary>
    /// Одобрить отзыв.
    /// </summary>
    /// <param name="id">Идентификатор отзыва.</param>
    /// <returns>true, если отзыв успешно одобрен.</returns>
    public async Task<bool> ApproveAsync(Guid id)
    {
        try
        {
            var response = await _http.PatchAsync($"api/reviews/{id}/approve", null);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Отклонить отзыв.
    /// </summary>
    /// <param name="id">Идентификатор отзыва.</param>
    /// <returns>true, если отзыв успешно отклонён.</returns>
    public async Task<bool> RejectAsync(Guid id)
    {
        try
        {
            var response = await _http.PatchAsync($"api/reviews/{id}/reject", null);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
