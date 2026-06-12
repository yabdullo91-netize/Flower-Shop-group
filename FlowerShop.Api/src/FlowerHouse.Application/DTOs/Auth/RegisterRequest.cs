namespace FlowerHouse.Application.DTOs.Auth;

public class RegisterRequest
{
    public string Phone { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Role { get; set; } // Customer|Admin|SuperAdmin
}
