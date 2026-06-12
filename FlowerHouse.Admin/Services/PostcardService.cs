using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Postcards;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис управления открытками и шаблонами текстов — CRUD операции.
/// </summary>
public class PostcardService(HttpClient http)
{
    private readonly HttpClient _http = http;

    #region Открытки

    /// <summary>
    /// Получить список всех открыток.
    /// </summary>
    /// <returns>Список открыток.</returns>
    public async Task<List<PostcardDto>> GetPostcardsAsync()
    {
        try
        {
            return await _http.GetFromJsonAsync<List<PostcardDto>>("api/postcards") ?? [];
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// Создать новую открытку.
    /// </summary>
    /// <param name="request">Данные новой открытки.</param>
    /// <returns>true, если открытка успешно создана.</returns>
    public async Task<bool> CreatePostcardAsync(PostcardCreateRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/postcards", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Обновить существующую открытку.
    /// </summary>
    /// <param name="id">Идентификатор открытки.</param>
    /// <param name="request">Обновлённые данные.</param>
    /// <returns>true, если открытка успешно обновлена.</returns>
    public async Task<bool> UpdatePostcardAsync(int id, PostcardCreateRequest request)
    {
        try
        {
            var response = await _http.PutAsJsonAsync($"api/postcards/{id}", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Удалить открытку.
    /// </summary>
    /// <param name="id">Идентификатор открытки.</param>
    /// <returns>true, если открытка успешно удалена.</returns>
    public async Task<bool> DeletePostcardAsync(int id)
    {
        try
        {
            var response = await _http.DeleteAsync($"api/postcards/{id}");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    #endregion

    #region Шаблоны текстов

    /// <summary>
    /// Получить список всех шаблонов текстов для открыток.
    /// </summary>
    /// <returns>Список шаблонов.</returns>
    public async Task<List<MessageTemplateDto>> GetTemplatesAsync()
    {
        try
        {
            return await _http.GetFromJsonAsync<List<MessageTemplateDto>>("api/message-templates") ?? [];
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// Создать новый шаблон текста.
    /// </summary>
    /// <param name="request">Данные нового шаблона.</param>
    /// <returns>true, если шаблон успешно создан.</returns>
    public async Task<bool> CreateTemplateAsync(MessageTemplateCreateRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/message-templates", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Обновить существующий шаблон текста.
    /// </summary>
    /// <param name="id">Идентификатор шаблона.</param>
    /// <param name="request">Обновлённые данные.</param>
    /// <returns>true, если шаблон успешно обновлён.</returns>
    public async Task<bool> UpdateTemplateAsync(int id, MessageTemplateCreateRequest request)
    {
        try
        {
            var response = await _http.PutAsJsonAsync($"api/message-templates/{id}", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Удалить шаблон текста.
    /// </summary>
    /// <param name="id">Идентификатор шаблона.</param>
    /// <returns>true, если шаблон успешно удалён.</returns>
    public async Task<bool> DeleteTemplateAsync(int id)
    {
        try
        {
            var response = await _http.DeleteAsync($"api/message-templates/{id}");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    #endregion
}
