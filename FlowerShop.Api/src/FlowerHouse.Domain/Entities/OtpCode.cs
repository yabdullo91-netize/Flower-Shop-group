namespace FlowerHouse.Domain.Entities;

public class OtpCode : BaseEntity
{
    public string Phone { get; set; } = string.Empty;
    public string CodeHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }
    public int Attempts { get; set; }
}