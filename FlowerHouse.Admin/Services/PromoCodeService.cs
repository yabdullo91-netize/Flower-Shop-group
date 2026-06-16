using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Common;
using FlowerHouse.Admin.Models.Promo;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис управления промокодами — CRUD операции.
/// </summary>
public class PromoCodeService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить список промокодов с пагинацией.
    /// </summary>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <returns>Постраничный результат с промокодами.</returns>
    public async Task<PagedResult<PromoCodeDto>> GetPromoCodesAsync(int page = 1, int pageSize = 20)
    {
        try
        {
            return await _http.GetFromJsonAsync<PagedResult<PromoCodeDto>>(
                $"api/admin/promo-codes?page={page}&pageSize={pageSize}") ?? new();
        }
        catch
        {
            return new();
        }
    }

    /// <summary>
    /// Создать новый промокод.
    /// </summary>
    /// <param name="request">Данные нового промокода.</param>
    /// <returns>true, если промокод успешно создан.</returns>
    public async Task<bool> CreateAsync(PromoCodeCreateRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/admin/promo-codes", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Обновить существующий промокод.
    /// </summary>
    /// <param name="id">Идентификатор промокода.</param>
    /// <param name="request">Обновлённые данные.</param>
    /// <returns>true, если промокод успешно обновлён.</returns>
    public async Task<bool> UpdateAsync(Guid id, PromoCodeCreateRequest request)
    {
        try
        {
            var response = await _http.PutAsJsonAsync($"api/admin/promo-codes/{id}", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Удалить промокод.
    /// </summary>
    /// <param name="id">Идентификатор промокода.</param>
    /// <returns>true, если промокод успешно удалён.</returns>
    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            var response = await _http.DeleteAsync($"api/admin/promo-codes/{id}");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
