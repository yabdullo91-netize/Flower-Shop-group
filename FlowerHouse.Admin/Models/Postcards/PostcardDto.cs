namespace FlowerHouse.Admin.Models.Postcards;
public class PostcardDto { public Guid Id { get; set; } public string Name { get; set; } = ""; public string? ImageUrl { get; set; } public decimal Price { get; set; } public bool IsActive { get; set; } }
