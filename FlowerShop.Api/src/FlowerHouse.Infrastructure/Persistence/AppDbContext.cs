using Microsoft.EntityFrameworkCore;
using FlowerHouse.Domain.Entities;

namespace FlowerHouse.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Auth
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<OtpCode> OtpCodes { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    // Catalog
    public DbSet<Product> Products { get; set; } = null!;
    public DbSet<ProductSize> ProductSizes { get; set; } = null!;
    public DbSet<ProductImage> ProductImages { get; set; } = null!;
    public DbSet<ProductPackagingOption> ProductPackagingOptions { get; set; } = null!;
    public DbSet<ProductStemOption> ProductStemOptions { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;

    // Addons & Postcards
    public DbSet<Addon> Addons { get; set; } = null!;
    public DbSet<Postcard> Postcards { get; set; } = null!;
    public DbSet<MessageTemplate> MessageTemplates { get; set; } = null!;

    // Promo
    public DbSet<PromoCode> PromoCodes { get; set; } = null!;

    // Orders
    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<OrderItem> OrderItems { get; set; } = null!;
    public DbSet<OrderAddon> OrderAddons { get; set; } = null!;
    public DbSet<OrderStatusHistory> OrderStatusHistories { get; set; } = null!;

    // Loyalty
    public DbSet<LoyaltyAccount> LoyaltyAccounts { get; set; } = null!;
    public DbSet<LoyaltyTransaction> LoyaltyTransactions { get; set; } = null!;

    // Reviews
    public DbSet<Review> Reviews { get; set; } = null!;
    public DbSet<ReviewPhoto> ReviewPhotos { get; set; } = null!;

    // Favorites
    public DbSet<Favorite> Favorites { get; set; } = null!;

    // Content
    public DbSet<Banner> Banners { get; set; } = null!;
    public DbSet<DeliveryTimeSlot> DeliveryTimeSlots { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Composite PK for Favorites
        modelBuilder.Entity<Favorite>()
            .HasKey(f => new { f.UserId, f.ProductId });

        // Unique index on User.Phone
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Phone)
            .IsUnique();

        // Unique index on Product.Slug
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Slug)
            .IsUnique();

        // Unique index on PromoCode.Code
        modelBuilder.Entity<PromoCode>()
            .HasIndex(p => p.Code)
            .IsUnique();

        // Unique index on Category.Slug
        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        // PostgreSQL array columns
        modelBuilder.Entity<Product>()
            .Property(p => p.Occasions)
            .HasColumnType("text[]");

        modelBuilder.Entity<Product>()
            .Property(p => p.FlowerTypes)
            .HasColumnType("text[]");

        modelBuilder.Entity<Product>()
            .Property(p => p.Colors)
            .HasColumnType("text[]");
    }
}