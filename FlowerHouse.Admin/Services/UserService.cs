using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Common;
using FlowerHouse.Admin.Models.Users;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис управления пользователями — список, блокировка, смена роли, создание администратора.
/// </summary>
public class UserService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить список пользователей с пагинацией и поиском.
    /// </summary>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <param name="search">Поиск по имени или телефону.</param>
    /// <returns>Постраничный результат с пользователями.</returns>
    public async Task<PagedResult<UserDto>> GetUsersAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null)
    {
        try
        {
            var query = $"api/admin/users?page={page}&pageSize={pageSize}";

            if (!string.IsNullOrWhiteSpace(search))
                query += $"&search={Uri.EscapeDataString(search)}";

            return await _http.GetFromJsonAsync<PagedResult<UserDto>>(query) ?? new();
        }
        catch
        {
            return new();
        }
    }

    /// <summary>
    /// Получить пользователя по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор пользователя.</param>
    /// <returns>Пользователь или null, если не найден.</returns>
    public async Task<UserDto?> GetUserAsync(int id)
    {
        try
        {
            return await _http.GetFromJsonAsync<UserDto>($"api/admin/users/{id}");
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Заблокировать пользователя.
    /// </summary>
    /// <param name="id">Идентификатор пользователя.</param>
    /// <returns>true, если пользователь успешно заблокирован.</returns>
    public async Task<bool> BlockUserAsync(int id)
    {
        try
        {
            var response = await _http.PatchAsync($"api/admin/users/{id}/block", null);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Разблокировать пользователя.
    /// </summary>
    /// <param name="id">Идентификатор пользователя.</param>
    /// <returns>true, если пользователь успешно разблокирован.</returns>
    public async Task<bool> UnblockUserAsync(int id)
    {
        try
        {
            var response = await _http.PatchAsync($"api/admin/users/{id}/unblock", null);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Изменить роль пользователя.
    /// </summary>
    /// <param name="id">Идентификатор пользователя.</param>
    /// <param name="role">Новая роль (User, Admin, SuperAdmin).</param>
    /// <returns>true, если роль успешно изменена.</returns>
    public async Task<bool> ChangeRoleAsync(int id, string role)
    {
        try
        {
            var response = await _http.PatchAsJsonAsync($"api/admin/users/{id}/role", new { Role = role });
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Создать нового администратора.
    /// </summary>
    /// <param name="request">Данные нового администратора.</param>
    /// <returns>true, если администратор успешно создан.</returns>
    public async Task<bool> CreateAdminAsync(CreateAdminRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/admin/users", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
