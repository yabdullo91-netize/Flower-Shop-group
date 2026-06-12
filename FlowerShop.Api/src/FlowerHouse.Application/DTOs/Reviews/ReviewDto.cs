using System;
using System.Collections.Generic;

namespace FlowerHouse.Application.DTOs.Reviews;

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public Guid OrderId { get; set; }
    public int Rating { get; set; }
    public string? Text { get; set; }
    public string Status { get; set; } = string.Empty;
    public int HelpfulCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ReviewPhotoDto> Photos { get; set; } = [];
}

public class ReviewPhotoDto
{
    public Guid Id { get; set; }
    public string Url { get; set; } = string.Empty;
}
