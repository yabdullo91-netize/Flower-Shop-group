using FlowerHouse.Application.Interfaces;
using FlowerHouse.Application.Services;
using FluentValidation;
using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace FlowerHouse.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMapster();
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IProfileService, ProfileService>();
        services.AddScoped<IPromoService, PromoService>();
        services.AddScoped<IContentService, ContentService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ILoyaltyService, LoyaltyService>();

        return services;
    }
}