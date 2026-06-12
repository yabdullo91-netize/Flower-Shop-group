using System;
using System.Collections.Generic;

namespace FlowerHouse.Application.DTOs.Reviews;

public class CreateReviewRequest
{
    public Guid ProductId { get; set; }
    public Guid OrderId { get; set; }
    public int Rating { get; set; }
    public string? Text { get; set; }
    public List<string> Photos { get; set; } = [];
}
