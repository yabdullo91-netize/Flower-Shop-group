using FlowerHouse.Application.DTOs.Orders;

namespace FlowerHouse.Application.Interfaces;

public interface IPromoService
{
    Task<object> ValidateAsync(ValidatePromoRequest request);
}