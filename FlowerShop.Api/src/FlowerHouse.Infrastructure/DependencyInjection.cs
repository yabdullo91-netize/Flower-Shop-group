using FlowerHouse.Domain.Interfaces;
using FlowerHouse.Infrastructure.Persistence;
using FlowerHouse.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FlowerHouse.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
        });

        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<FlowerHouse.Domain.Interfaces.IFileStorageService, LocalFileStorageService>();

        return services;
    }
}