namespace FlowerHouse.Admin.Models.Addons;
public class AddonDto { public Guid Id { get; set; } public string Name { get; set; } = ""; public decimal Price { get; set; } public string? ImageUrl { get; set; } public bool IsActive { get; set; } }
