using System.Net.Http.Json;
using FlowerHouse.Admin.Models.Common;
using FlowerHouse.Admin.Models.Dashboard;
using FlowerHouse.Admin.Models.Orders;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Сервис дашборда — статистика, графики, топ-товары и последние заказы.
/// </summary>
public class DashboardService(HttpClient http)
{
    private readonly HttpClient _http = http;

    /// <summary>
    /// Получить основную статистику дашборда (заказы, выручка, средний чек).
    /// </summary>
    /// <returns>Статистика дашборда.</returns>
    public async Task<DashboardStatsDto?> GetStatsAsync()
    {
        try
        {
            return await _http.GetFromJsonAsync<DashboardStatsDto>("api/admin/dashboard/stats");
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Получить данные для графика заказов за указанное количество дней.
    /// </summary>
    /// <param name="days">Количество дней (по умолчанию 30).</param>
    /// <returns>Данные для графика.</returns>
    public async Task<OrdersChartDto?> GetOrdersChartAsync(int days = 30)
    {
        try
        {
            return await _http.GetFromJsonAsync<OrdersChartDto>(
                $"api/admin/dashboard/orders-chart?days={days}");
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Получить список самых продаваемых товаров.
    /// </summary>
    /// <param name="count">Количество товаров (по умолчанию 5).</param>
    /// <returns>Список топ-товаров.</returns>
    public async Task<List<TopProductDto>> GetTopProductsAsync(int count = 5)
    {
        try
        {
            return await _http.GetFromJsonAsync<List<TopProductDto>>(
                $"api/admin/dashboard/top-products?count={count}") ?? [];
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// Получить последние заказы для отображения на дашборде.
    /// </summary>
    /// <param name="count">Количество заказов (по умолчанию 5).</param>
    /// <returns>Постраничный результат с заказами.</returns>
    public async Task<PagedResult<OrderDto>> GetRecentOrdersAsync(int count = 5)
    {
        try
        {
            return await _http.GetFromJsonAsync<PagedResult<OrderDto>>(
                $"api/orders?pageSize={count}&page=1") ?? new();
        }
        catch
        {
            return new();
        }
    }
}
