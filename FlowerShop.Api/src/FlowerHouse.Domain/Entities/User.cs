using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlowerHouse.Domain.Entities
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = null!; // +992XXXXXXXXX

        [MaxLength(100)]
        public string? Name { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "Customer"; // Customer|Admin|SuperAdmin

        public bool IsBlocked { get; set; } = false;

        public string? PushToken { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}