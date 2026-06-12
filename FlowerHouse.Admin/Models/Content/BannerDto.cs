namespace FlowerHouse.Admin.Models.Content;
public class BannerDto { public int Id { get; set; } public string Title { get; set; } = ""; public string? ImageUrl { get; set; } public string? LinkUrl { get; set; } public int SortOrder { get; set; } public bool IsActive { get; set; } }
