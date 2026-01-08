export type AdminTheme = 'dark' | 'light';

const STORAGE_KEY = 'admin-theme';

export const useAdminTheme = () => {
  const theme = useState<AdminTheme>('admin-theme', () => {
    // Default to dark theme, will be updated on client
    return 'dark';
  });

  const isLight = computed(() => theme.value === 'light');
  const isDark = computed(() => theme.value === 'dark');

  // Initialize theme from localStorage on client
  const initTheme = () => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
      if (stored && (stored === 'dark' || stored === 'light')) {
        theme.value = stored;
      }
    }
  };

  // Toggle between themes
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, theme.value);
    }
  };

  // Set a specific theme
  const setTheme = (newTheme: AdminTheme) => {
    theme.value = newTheme;
    if (process.client) {
      localStorage.setItem(STORAGE_KEY, theme.value);
    }
  };

  // Initialize on composable use
  initTheme();

  return {
    theme,
    isLight,
    isDark,
    toggleTheme,
    setTheme,
  };
};
