namespace FlowerHouse.Admin.Models.Promo;
public class PromoCodeCreateRequest { public string Code { get; set; } = ""; public string DiscountType { get; set; } = ""; public decimal DiscountValue { get; set; } public decimal? MinOrderAmount { get; set; } public int? MaxUsages { get; set; } public DateTime? ExpiresAt { get; set; } public bool IsActive { get; set; } }
