using FlowerShop.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace FlowerShop.Domain.Entities;

public class User : IdentityUser<int>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<Favourite> Favourites { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<CartItem> CartItems { get; set; } = [];
}
