using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Common;
using FlowerHouse.Admin.Models.Products;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис управления товарами — CRUD, изображения, категории.
/// </summary>
public class ProductService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить список товаров с пагинацией и фильтрацией.
    /// </summary>
    /// <param name="page">Номер страницы.</param>
    /// <param name="pageSize">Размер страницы.</param>
    /// <param name="search">Поиск по названию.</param>
    /// <param name="categoryId">Фильтр по категории.</param>
    /// <returns>Постраничный результат с товарами.</returns>
    public async Task<PagedResult<ProductDto>> GetProductsAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        int? categoryId = null)
    {
        try
        {
            var query = $"api/products?page={page}&pageSize={pageSize}";

            if (!string.IsNullOrWhiteSpace(search))
                query += $"&search={Uri.EscapeDataString(search)}";

            if (categoryId.HasValue)
                query += $"&categoryId={categoryId.Value}";

            return await _http.GetFromJsonAsync<PagedResult<ProductDto>>(query) ?? new();
        }
        catch
        {
            return new();
        }
    }

    /// <summary>
    /// Получить товар по идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор товара.</param>
    /// <returns>Товар или null, если не найден.</returns>
    public async Task<ProductDto?> GetProductAsync(Guid id)
    {
        try
        {
            return await _http.GetFromJsonAsync<ProductDto>($"api/products/{id}");
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Создать новый товар.
    /// </summary>
    /// <param name="request">Данные нового товара.</param>
    /// <returns>Созданный товар или null при ошибке.</returns>
    public async Task<ProductDto?> CreateProductAsync(ProductCreateRequest request)
    {
        try
        {
            var response = await _http.PostAsJsonAsync("api/products", request);

            if (!response.IsSuccessStatusCode)
                return null;

            return await response.Content.ReadFromJsonAsync<ProductDto>();
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Обновить существующий товар.
    /// </summary>
    /// <param name="id">Идентификатор товара.</param>
    /// <param name="request">Обновлённые данные товара.</param>
    /// <returns>true, если товар успешно обновлён.</returns>
    public async Task<bool> UpdateProductAsync(Guid id, ProductCreateRequest request)
    {
        try
        {
            var response = await _http.PutAsJsonAsync($"api/products/{id}", request);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Удалить товар.
    /// </summary>
    /// <param name="id">Идентификатор товара.</param>
    /// <returns>true, если товар успешно удалён.</returns>
    public async Task<bool> DeleteProductAsync(Guid id)
    {
        try
        {
            var response = await _http.DeleteAsync($"api/products/{id}");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Загрузить изображения для товара.
    /// </summary>
    /// <param name="id">Идентификатор товара.</param>
    /// <param name="content">Содержимое формы с файлами.</param>
    /// <returns>true, если изображения успешно загружены.</returns>
    public async Task<bool> UploadImagesAsync(Guid id, MultipartFormDataContent content)
    {
        try
        {
            var response = await _http.PostAsync($"api/products/{id}/images", content);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Удалить изображение товара.
    /// </summary>
    /// <param name="productId">Идентификатор товара.</param>
    /// <param name="imageId">Идентификатор изображения.</param>
    /// <returns>true, если изображение успешно удалено.</returns>
    public async Task<bool> DeleteImageAsync(Guid productId, Guid imageId)
    {
        try
        {
            var response = await _http.DeleteAsync($"api/products/{productId}/images/{imageId}");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Получить список всех категорий.
    /// </summary>
    /// <returns>Список категорий.</returns>
    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        try
        {
            return await _http.GetFromJsonAsync<List<CategoryDto>>("api/categories") ?? [];
        }
        catch
        {
            return [];
        }
    }
}
