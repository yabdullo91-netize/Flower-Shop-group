namespace FlowerHouse.Admin.Models.Orders;
public class OrderAddonDto { public Guid AddonId { get; set; } public string Name { get; set; } = ""; public string AddonName { get => Name; set => Name = value; } public int Quantity { get; set; } public decimal Price { get; set; } }
