$models = @{
"Models/Addons/AddonCreateRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Addons;
public class AddonCreateRequest { public string Name { get; set; } = ""; public decimal Price { get; set; } public bool IsActive { get; set; } }
"@
"Models/Addons/AddonDto.cs" = @"
namespace FlowerHouse.Admin.Models.Addons;
public class AddonDto { public int Id { get; set; } public string Name { get; set; } = ""; public decimal Price { get; set; } public string? ImageUrl { get; set; } public bool IsActive { get; set; } }
"@
"Models/Auth/AuthResponse.cs" = @"
namespace FlowerHouse.Admin.Models.Auth;
public class AuthResponse { public string AccessToken { get; set; } = ""; public string RefreshToken { get; set; } = ""; public string Role { get; set; } = ""; public string? Name { get; set; } }
"@
"Models/Auth/SendOtpRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Auth;
public class SendOtpRequest { public string Phone { get; set; } = ""; }
"@
"Models/Auth/VerifyOtpRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Auth;
public class VerifyOtpRequest { public string Phone { get; set; } = ""; public string Code { get; set; } = ""; }
"@
"Models/Common/ApiErrorResponse.cs" = @"
namespace FlowerHouse.Admin.Models.Common;
public class ApiErrorResponse { public string Message { get; set; } = ""; public string? Details { get; set; } public Dictionary<string, string[]>? Errors { get; set; } }
"@
"Models/Content/BannerCreateRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Content;
public class BannerCreateRequest { public string Title { get; set; } = ""; public string? LinkUrl { get; set; } public int SortOrder { get; set; } public bool IsActive { get; set; } }
"@
"Models/Content/BannerDto.cs" = @"
namespace FlowerHouse.Admin.Models.Content;
public class BannerDto { public int Id { get; set; } public string Title { get; set; } = ""; public string? ImageUrl { get; set; } public string? LinkUrl { get; set; } public int SortOrder { get; set; } public bool IsActive { get; set; } }
"@
"Models/Dashboard/DashboardStatsDto.cs" = @"
namespace FlowerHouse.Admin.Models.Dashboard;
public class DashboardStatsDto { public int OrdersToday { get; set; } public decimal RevenueToday { get; set; } public int NewCustomers { get; set; } public decimal AverageCheck { get; set; } public decimal OrdersTodayChange { get; set; } public decimal RevenueTodayChange { get; set; } }
"@
"Models/Dashboard/OrdersChartDto.cs" = @"
namespace FlowerHouse.Admin.Models.Dashboard;
public class OrdersChartDto { public List<string> Labels { get; set; } = []; public List<int> Values { get; set; } = []; public List<decimal> Revenue { get; set; } = []; }
"@
"Models/Dashboard/TopProductDto.cs" = @"
namespace FlowerHouse.Admin.Models.Dashboard;
public class TopProductDto { public int ProductId { get; set; } public string Name { get; set; } = ""; public string? ImageUrl { get; set; } public int SoldCount { get; set; } public decimal Revenue { get; set; } }
"@
"Models/Delivery/TimeSlotCreateRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Delivery;
public class TimeSlotCreateRequest { public string StartTime { get; set; } = ""; public string EndTime { get; set; } = ""; public bool IsActive { get; set; } public int MaxOrders { get; set; } }
"@
"Models/Delivery/TimeSlotDto.cs" = @"
namespace FlowerHouse.Admin.Models.Delivery;
public class TimeSlotDto { public int Id { get; set; } public string StartTime { get; set; } = ""; public string EndTime { get; set; } = ""; public bool IsActive { get; set; } public int MaxOrders { get; set; } public int CurrentOrders { get; set; } }
"@
"Models/Loyalty/AdjustPointsRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Loyalty;
public class AdjustPointsRequest { public int UserId { get; set; } public int Amount { get; set; } public string Reason { get; set; } = ""; }
"@
"Models/Loyalty/LoyaltyAccountDto.cs" = @"
namespace FlowerHouse.Admin.Models.Loyalty;
public class LoyaltyAccountDto { public int UserId { get; set; } public string UserName { get; set; } = ""; public string UserPhone { get; set; } = ""; public int Balance { get; set; } public string Tier { get; set; } = ""; public int TotalEarned { get; set; } public int TotalSpent { get; set; } }
"@
"Models/Loyalty/LoyaltyTransactionDto.cs" = @"
namespace FlowerHouse.Admin.Models.Loyalty;
public class LoyaltyTransactionDto { public int Id { get; set; } public int Amount { get; set; } public string Type { get; set; } = ""; public string Description { get; set; } = ""; public DateTime CreatedAt { get; set; } }
"@
"Models/Orders/OrderAddonDto.cs" = @"
namespace FlowerHouse.Admin.Models.Orders;
public class OrderAddonDto { public int AddonId { get; set; } public string Name { get; set; } = ""; public int Quantity { get; set; } public decimal Price { get; set; } }
"@
"Models/Orders/OrderDto.cs" = @"
namespace FlowerHouse.Admin.Models.Orders;
public class OrderDto { public int Id { get; set; } public string OrderNumber { get; set; } = ""; public string Status { get; set; } = ""; public DateTime CreatedAt { get; set; } public DateTime? DeliveryDate { get; set; } public string? DeliveryTimeSlot { get; set; } public string CustomerName { get; set; } = ""; public string CustomerPhone { get; set; } = ""; public string RecipientName { get; set; } = ""; public string RecipientPhone { get; set; } = ""; public string DeliveryAddress { get; set; } = ""; public List<OrderItemDto> Items { get; set; } = []; public List<OrderAddonDto>? Addons { get; set; } public string? PostcardText { get; set; } public string? PostcardImageUrl { get; set; } public bool IsAnonymous { get; set; } public decimal Subtotal { get; set; } public decimal DeliveryFee { get; set; } public decimal Discount { get; set; } public decimal BonusUsed { get; set; } public decimal Total { get; set; } public string? PromoCode { get; set; } public string PaymentMethod { get; set; } = ""; public string? PhotoUrl { get; set; } public List<OrderTimelineDto>? Timeline { get; set; } }
"@
"Models/Orders/OrderItemDto.cs" = @"
namespace FlowerHouse.Admin.Models.Orders;
public class OrderItemDto { public int ProductId { get; set; } public string ProductName { get; set; } = ""; public string? ImageUrl { get; set; } public int Quantity { get; set; } public decimal Price { get; set; } public string? SizeName { get; set; } }
"@
"Models/Orders/OrderStatusUpdateRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Orders;
public class OrderStatusUpdateRequest { public string Status { get; set; } = ""; public string? Comment { get; set; } }
"@
"Models/Orders/OrderTimelineDto.cs" = @"
namespace FlowerHouse.Admin.Models.Orders;
public class OrderTimelineDto { public string Status { get; set; } = ""; public DateTime Timestamp { get; set; } public string? Comment { get; set; } }
"@
"Models/Postcards/MessageTemplateCreateRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Postcards;
public class MessageTemplateCreateRequest { public string Text { get; set; } = ""; public string? Category { get; set; } public bool IsActive { get; set; } }
"@
"Models/Postcards/MessageTemplateDto.cs" = @"
namespace FlowerHouse.Admin.Models.Postcards;
public class MessageTemplateDto { public int Id { get; set; } public string Text { get; set; } = ""; public string? Category { get; set; } public bool IsActive { get; set; } }
"@
"Models/Postcards/PostcardCreateRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Postcards;
public class PostcardCreateRequest { public string Name { get; set; } = ""; public decimal Price { get; set; } public bool IsActive { get; set; } }
"@
"Models/Postcards/PostcardDto.cs" = @"
namespace FlowerHouse.Admin.Models.Postcards;
public class PostcardDto { public int Id { get; set; } public string Name { get; set; } = ""; public string? ImageUrl { get; set; } public decimal Price { get; set; } public bool IsActive { get; set; } }
"@
"Models/Products/CategoryDto.cs" = @"
namespace FlowerHouse.Admin.Models.Products;
public class CategoryDto { public int Id { get; set; } public string Name { get; set; } = ""; public string? Slug { get; set; } public int ProductCount { get; set; } }
"@
"Models/Products/ProductDto.cs" = @"
namespace FlowerHouse.Admin.Models.Products;
public class ProductDto { public int Id { get; set; } public string Name { get; set; } = ""; public string Slug { get; set; } = ""; public string? Description { get; set; } public decimal Price { get; set; } public decimal? DiscountPrice { get; set; } public string CategoryName { get; set; } = ""; public int CategoryId { get; set; } public List<string> Tags { get; set; } = []; public List<ProductImageDto> Images { get; set; } = []; public bool IsActive { get; set; } public bool DeliverToday { get; set; } public string? Occasion { get; set; } public string? Freshness { get; set; } public string? Kind { get; set; } public string? Packaging { get; set; } public List<ProductSizeDto>? Sizes { get; set; } public DateTime CreatedAt { get; set; } }
"@
"Models/Products/ProductImageDto.cs" = @"
namespace FlowerHouse.Admin.Models.Products;
public class ProductImageDto { public int Id { get; set; } public string Url { get; set; } = ""; public bool IsMain { get; set; } public int SortOrder { get; set; } }
"@
"Models/Promo/PromoCodeCreateRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Promo;
public class PromoCodeCreateRequest { public string Code { get; set; } = ""; public string DiscountType { get; set; } = ""; public decimal DiscountValue { get; set; } public decimal? MinOrderAmount { get; set; } public int? MaxUsages { get; set; } public DateTime? ExpiresAt { get; set; } public bool IsActive { get; set; } }
"@
"Models/Promo/PromoCodeDto.cs" = @"
namespace FlowerHouse.Admin.Models.Promo;
public class PromoCodeDto { public int Id { get; set; } public string Code { get; set; } = ""; public string DiscountType { get; set; } = ""; public decimal DiscountValue { get; set; } public decimal? MinOrderAmount { get; set; } public int? MaxUsages { get; set; } public int CurrentUsages { get; set; } public DateTime? ExpiresAt { get; set; } public bool IsActive { get; set; } }
"@
"Models/Push/PushSendRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Push;
public class PushSendRequest { public string Title { get; set; } = ""; public string Body { get; set; } = ""; public string? Url { get; set; } }
"@
"Models/Reviews/ReviewDto.cs" = @"
namespace FlowerHouse.Admin.Models.Reviews;
public class ReviewDto { public int Id { get; set; } public int ProductId { get; set; } public string ProductName { get; set; } = ""; public int UserId { get; set; } public string UserName { get; set; } = ""; public string UserPhone { get; set; } = ""; public int Rating { get; set; } public string? Text { get; set; } public List<string>? PhotoUrls { get; set; } public string Status { get; set; } = ""; public DateTime CreatedAt { get; set; } }
"@
"Models/Settings/AuditLogDto.cs" = @"
namespace FlowerHouse.Admin.Models.Settings;
public class AuditLogDto { public int Id { get; set; } public DateTime Timestamp { get; set; } public string UserName { get; set; } = ""; public string Action { get; set; } = ""; public string? Details { get; set; } public string? IpAddress { get; set; } }
"@
"Models/Settings/SystemSettingsDto.cs" = @"
namespace FlowerHouse.Admin.Models.Settings;
public class SystemSettingsDto { public string? SmtpHost { get; set; } public int SmtpPort { get; set; } public string? SmtpUser { get; set; } public string? SmtpPassword { get; set; } public bool SmtpUseSsl { get; set; } public string? VapidPublicKey { get; set; } public string? VapidPrivateKey { get; set; } public string? VapidSubject { get; set; } public decimal MinOrderAmount { get; set; } public int BonusPercentage { get; set; } public int BonusTierSilver { get; set; } public int BonusTierGold { get; set; } }
"@
"Models/Users/CreateAdminRequest.cs" = @"
namespace FlowerHouse.Admin.Models.Users;
public class CreateAdminRequest { public string Phone { get; set; } = ""; public string Name { get; set; } = ""; public string Role { get; set; } = ""; }
"@
"Models/Users/UserDto.cs" = @"
namespace FlowerHouse.Admin.Models.Users;
public class UserDto { public int Id { get; set; } public string Phone { get; set; } = ""; public string? Name { get; set; } public string Role { get; set; } = ""; public bool IsBlocked { get; set; } public int OrderCount { get; set; } public decimal TotalSpent { get; set; } public DateTime CreatedAt { get; set; } }
"@
}

foreach ($kv in $models.GetEnumerator()) {
    $path = Join-Path $PWD $kv.Key
    $dir = Split-Path $path -Parent
    if (-not (Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force | Out-Null }
    Set-Content -Path $path -Value $kv.Value.Trim() -Encoding UTF8
}
Write-Host "All $($models.Count) model files regenerated successfully"
