const STORAGE_KEY = 'admin-sidebar-collapsed';

export const useAdminSidebar = () => {
  const isCollapsed = useState<boolean>('admin-sidebar-collapsed', () => false);

  // Initialize from localStorage on client
  const initSidebar = () => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        isCollapsed.value = stored === 'true';
      }
    }
  };

  // Toggle collapsed state
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed.value));
    }
  };

  // Set collapsed state
  const setCollapsed = (collapsed: boolean) => {
    isCollapsed.value = collapsed;
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    }
  };

  // Initialize on composable use
  initSidebar();

  return {
    isCollapsed,
    toggleSidebar,
    setCollapsed,
  };
};
