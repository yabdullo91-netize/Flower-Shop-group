using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FlowerHouse.Domain.Entities
{
    public class Product
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Slug { get; set; } = null!;

        [Required]
        [MaxLength(300)]
        public string Name { get; set; } = null!;

        public string? Composition { get; set; }
        public string? Description { get; set; }

        [Required]
        [MaxLength(20)]
        public string Kind { get; set; } = "bouquet"; // bouquet|single

        [Required]
        [MaxLength(20)]
        public string Freshness { get; set; } = "live"; // live|dried

        public decimal? BasePrice { get; set; }

        // Arrays (stored as JSONB via EF Core value converters)
        public string[] Occasions { get; set; } = Array.Empty<string>();
        public string[] FlowerTypes { get; set; } = Array.Empty<string>();
        public string[] Colors { get; set; } = Array.Empty<string>();

        public bool IsNew { get; set; } = false;
        public bool IsHit { get; set; } = false;
        public bool InStock { get; set; } = true;
        public bool DeliverToday { get; set; } = false;
        public bool IsActive { get; set; } = true;

        public string? MetaTitle { get; set; }
        public string? MetaDesc { get; set; }

        public decimal Rating { get; set; } = 0;
        public int ReviewCount { get; set; } = 0;
        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation collections (optional, can be added later)
        public ICollection<ProductSize> Sizes { get; set; } = new List<ProductSize>();
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
}