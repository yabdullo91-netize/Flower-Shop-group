using FlowerHouse.Domain.Enums;

namespace FlowerHouse.Domain.Entities;

public class Review : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int Rating { get; set; }
    public string? Text { get; set; }
    public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
    public int HelpfulCount { get; set; }

    public ICollection<ReviewPhoto> Photos { get; set; } = [];
}