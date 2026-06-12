using System;

namespace FlowerHouse.Admin.Services.State
{
    /// <summary>
    /// Сервис глобального состояния интерфейса панелей управления.
    /// </summary>
    public class UIStateService
    {
        // Состояние боковой панели
        public bool SidebarOpen { get; private set; } = true;
        public event Action? OnSidebarToggle;

        // Выбранный тенант (организация)
        public int ActiveTenantId { get; private set; } = 1;
        public string ActiveTenantName { get; private set; } = "Главный филиал (Душанбе)";
        public event Action? OnTenantChanged;

        public void ToggleSidebar()
        {
            SidebarOpen = !SidebarOpen;
            OnSidebarToggle?.Invoke();
        }

        public void SetTenant(int id, string name)
        {
            ActiveTenantId = id;
            ActiveTenantName = name;
            OnTenantChanged?.Invoke();
        }
    }
}
