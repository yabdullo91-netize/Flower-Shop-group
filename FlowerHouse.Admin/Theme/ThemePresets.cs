using MudBlazor;

namespace FlowerHouse.Admin.Theme
{
    /// <summary>
    /// Цветовые палитры и настройки типографики для корпоративного стиля.
    /// </summary>
    public static class ThemePresets
    {
        public static MudTheme CreateEnterpriseTheme() => new()
        {
            PaletteLight = new PaletteLight()
            {
                Primary = "#7C3AED", // Violet 600
                Secondary = "#10B981", // Emerald 500
                Background = "#FAFAFA",
                Surface = "#FFFFFF",
                AppbarBackground = "#FFFFFF",
                AppbarText = "#09090B",
                DrawerBackground = "#FFFFFF",
                DrawerText = "#71717A",
                TextPrimary = "#09090B",
                TextSecondary = "#71717A",
                Divider = "#E4E4E7",
                TableLines = "#E4E4E7"
            },
            PaletteDark = new PaletteDark()
            {
                Primary = "#A78BFA", // Violet 400
                Secondary = "#34D399", // Emerald 400
                Background = "#09090B",
                Surface = "#121214",
                AppbarBackground = "#121214",
                AppbarText = "#F4F4F5",
                DrawerBackground = "#121214",
                DrawerText = "#A1A1AA",
                TextPrimary = "#F4F4F5",
                TextSecondary = "#A1A1AA",
                Divider = "#27272A",
                TableLines = "#27272A"
            },
            LayoutProperties = new LayoutProperties()
            {
                DefaultBorderRadius = "8px"
            }
        };
    }
}
