using FlowerHouse.Application.DTOs.Orders;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace FlowerHouse.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(Guid userId, CreateOrderRequest request);
    Task<List<OrderDto>> GetMyOrdersAsync(Guid userId);
    Task<OrderDto?> GetMyOrderByIdAsync(Guid userId, Guid orderId);
    Task<bool> CancelMyOrderAsync(Guid userId, Guid orderId);
    Task<List<OrderDto>> GetAllOrdersAsync(string? status, Guid? userId);
    Task<OrderDto?> GetOrderByIdAsync(Guid orderId);
    Task<bool> UpdateOrderStatusAsync(Guid orderId, string status, string? comment, Guid adminId);
    Task<string> UploadOrderPhotoAsync(Guid orderId, Stream fileStream, string fileName);
}
