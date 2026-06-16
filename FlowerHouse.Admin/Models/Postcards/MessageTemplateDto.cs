namespace FlowerHouse.Admin.Models.Postcards;
public class MessageTemplateDto { public Guid Id { get; set; } public string Text { get; set; } = ""; public string? Category { get; set; } public bool IsActive { get; set; } }
