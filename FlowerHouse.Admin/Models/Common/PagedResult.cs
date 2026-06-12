namespace FlowerHouse.Admin.Models.Common;

/// <summary>
/// Обёртка для постраничных результатов из API.
/// </summary>
/// <typeparam name="T">Тип элемента в списке.</typeparam>
public class PagedResult<T>
{
    /// <summary>
    /// Список элементов на текущей странице.
    /// </summary>
    public List<T> Items { get; set; } = [];

    /// <summary>
    /// Общее количество элементов.
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Текущая страница (начиная с 1).
    /// </summary>
    public int Page { get; set; }

    /// <summary>
    /// Размер страницы.
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Общее количество страниц (вычисляемое).
    /// </summary>
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
