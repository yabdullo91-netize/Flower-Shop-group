using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.AspNetCore.Components.Authorization;
using MudBlazor;
using MudBlazor.Services;
using FlowerHouse.Admin;
using FlowerHouse.Admin.Services;
using FlowerHouse.Admin.Services.State;


var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

// --- Конфигурация ---
var apiBaseUrl = builder.Configuration.GetValue<string>("ApiBaseUrl") ?? "https://localhost:5001";

// --- HttpClient с JWT-перехватчиком ---
builder.Services.AddScoped<JwtAuthorizationHandler>();
builder.Services.AddHttpClient("FlowerHouseApi", client =>
{
    client.BaseAddress = new Uri(apiBaseUrl);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
}).AddHttpMessageHandler<JwtAuthorizationHandler>();

builder.Services.AddScoped(sp =>
    sp.GetRequiredService<IHttpClientFactory>().CreateClient("FlowerHouseApi"));

// --- Аутентификация ---
builder.Services.AddAuthorizationCore();
builder.Services.AddScoped<LocalStorageService>();
builder.Services.AddScoped<JwtAuthStateProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(sp =>
    sp.GetRequiredService<JwtAuthStateProvider>());

// --- API-сервисы ---
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<LoyaltyService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<PromoCodeService>();
builder.Services.AddScoped<ContentService>();
builder.Services.AddScoped<AddonService>();
builder.Services.AddScoped<PostcardService>();
builder.Services.AddScoped<DeliveryService>();
builder.Services.AddScoped<PushService>();
builder.Services.AddScoped<SettingsService>();
builder.Services.AddScoped<DialogHelper>();
builder.Services.AddScoped<UIStateService>();

// --- MudBlazor ---
builder.Services.AddMudServices(config =>
{
    config.SnackbarConfiguration.PositionClass = Defaults.Classes.Position.BottomRight;
    config.SnackbarConfiguration.PreventDuplicates = false;
    config.SnackbarConfiguration.NewestOnTop = true;
    config.SnackbarConfiguration.ShowCloseIcon = true;
    config.SnackbarConfiguration.VisibleStateDuration = 4000;
    config.SnackbarConfiguration.HideTransitionDuration = 300;
    config.SnackbarConfiguration.ShowTransitionDuration = 300;
    config.SnackbarConfiguration.SnackbarVariant = Variant.Filled;
});

await builder.Build().RunAsync();
