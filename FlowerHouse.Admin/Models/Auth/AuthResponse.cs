namespace FlowerHouse.Admin.Models.Auth;
public class AuthResponse { public string AccessToken { get; set; } = ""; public string RefreshToken { get; set; } = ""; public string Role { get; set; } = ""; public string? Name { get; set; } }
