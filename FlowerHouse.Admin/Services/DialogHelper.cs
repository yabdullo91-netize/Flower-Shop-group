using MudBlazor;

namespace FlowerHouse.Admin.Services;

/// <summary>
/// Вспомогательный сервис для диалогов подтверждения.
/// </summary>
public class DialogHelper(IDialogService dialogs)
{
    private readonly IDialogService _dialogs = dialogs;

    /// <summary>
    /// Показывает простой диалог подтверждения. Возвращает true если пользователь подтвердил.
    /// </summary>
    public async Task<bool> ConfirmAsync(string message, string title = "Подтверждение")
    {
        var parameters = new DialogParameters
        {
            { "ContentText", message },
            { "Title", title }
        };
        var opts = new DialogOptions { MaxWidth = MaxWidth.ExtraSmall, FullWidth = true, CloseButton = false };
        var dialog = await _dialogs.ShowAsync<FlowerHouse.Admin.Components.Shared.ConfirmSimpleDialog>(title, parameters, opts);
        var result = await dialog.Result;
        return result is { Canceled: false };
    }
}
