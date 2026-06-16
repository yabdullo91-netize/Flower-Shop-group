using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Content;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис управления контентом — баннеры на главной странице.
/// </summary>
public class ContentService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить список всех баннеров.
    /// </summary>
    /// <returns>Список баннеров.</returns>
    public async Task<List<BannerDto>> GetBannersAsync()
    {
        try
        {
            return await _http.GetFromJsonAsync<List<BannerDto>>("api/admin/banners") ?? [];
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// Создать новый баннер (с загрузкой изображения через multipart).
    /// </summary>
    /// <param name="content">Содержимое формы с данными и изображением.</param>
    /// <returns>true, если баннер успешно создан.</returns>
    public async Task<bool> CreateBannerAsync(MultipartFormDataContent content)
    {
        try
        {
            var response = await _http.PostAsync("api/admin/banners", content);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Обновить существующий баннер.
    /// </summary>
    /// <param name="id">Идентификатор баннера.</param>
    /// <param name="content">Содержимое формы с обновлёнными данными.</param>
    /// <returns>true, если баннер успешно обновлён.</returns>
    public async Task<bool> UpdateBannerAsync(Guid id, MultipartFormDataContent content)
    {
        try
        {
            var response = await _http.PutAsync($"api/admin/banners/{id}", content);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Удалить баннер.
    /// </summary>
    /// <param name="id">Идентификатор баннера.</param>
    /// <returns>true, если баннер успешно удалён.</returns>
    public async Task<bool> DeleteBannerAsync(Guid id)
    {
        try
        {
            var response = await _http.DeleteAsync($"api/admin/banners/{id}");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
