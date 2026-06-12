using Microsoft.JSInterop;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Обёртка над localStorage через JS Interop (замена Blazored.LocalStorage).
/// </summary>
public class LocalStorageService
{
    private readonly IJSRuntime _js;

    public LocalStorageService(IJSRuntime js)
    {
        _js = js;
    }

    public async Task<string?> GetItemAsync(string key)
    {
        return await _js.InvokeAsync<string?>("localStorageHelper.getItem", key);
    }

    public async Task SetItemAsync(string key, string value)
    {
        await _js.InvokeVoidAsync("localStorageHelper.setItem", key, value);
    }

    public async Task RemoveItemAsync(string key)
    {
        await _js.InvokeVoidAsync("localStorageHelper.removeItem", key);
    }
}
