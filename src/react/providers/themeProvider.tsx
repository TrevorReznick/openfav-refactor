import * as React from 'react';
import { map } from 'nanostores';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  initialTheme?: Theme;
  initialSystemTheme?: Theme;
}

interface ThemeProviderState {
  theme: Theme;
  systemTheme: Theme | undefined;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  systemTheme: undefined,
};

export const themeStore = map<ThemeProviderState>(initialState);

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  systemTheme: Theme | undefined;
}

export const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  systemTheme: undefined,
});

export function ThemeWrapper({
  children,
  initialTheme = 'system',
  initialSystemTheme,
}: Omit<ThemeProviderProps, 'storageKey' | 'defaultTheme'>) {
  return (
    <ThemeProvider 
      defaultTheme={initialTheme}
      initialTheme={initialTheme}
      initialSystemTheme={initialSystemTheme}
    >
      {children}
    </ThemeProvider>
  );
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  initialTheme = defaultTheme,
  initialSystemTheme,
}: ThemeProviderProps): JSX.Element {
  const [mounted, setMounted] = React.useState(false);
  const [themeState, setThemeState] = React.useState<Theme>(() => {
    // Only access localStorage after mount to prevent hydration mismatch
    if (typeof window === 'undefined') return initialTheme;
    
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      return stored || initialTheme;
    } catch (e) {
      return initialTheme;
    }
  });
  
  const [systemTheme, setSystemTheme] = React.useState<Theme | undefined>(
    () => initialSystemTheme || 
    (typeof window !== 'undefined' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      undefined)
  );

  const applyTheme = React.useCallback((theme: Theme, sysTheme?: Theme) => {
    // Skip during SSR
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    const effectiveTheme = theme === 'system' 
      ? sysTheme || (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    if (effectiveTheme) {
      root.classList.add(effectiveTheme);
      root.setAttribute('data-theme', effectiveTheme);
    }
    
    // Only update store if values have changed to prevent unnecessary re-renders
    const currentState = themeStore.get();
    if (currentState.theme !== theme || currentState.systemTheme !== sysTheme) {
      themeStore.set({ 
        theme,
        systemTheme: sysTheme || (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
      });
    }
  }, []);

  const setTheme = React.useCallback((theme: Theme) => {
    // Skip during SSR
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(storageKey, theme);
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }
    
    setThemeState(theme);
    
    if (theme === 'system') {
      const sysTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setSystemTheme(sysTheme);
      applyTheme('system', sysTheme);
    } else {
      applyTheme(theme);
    }
  }, [applyTheme, storageKey]);

  // Initialize theme on client
  React.useEffect(() => {
    setMounted(true);
    
    // Get stored theme or use default
    const storedTheme = (() => {
      if (typeof window === 'undefined') return defaultTheme;
      const saved = localStorage.getItem(storageKey) as Theme | null;
      return saved || defaultTheme;
    })();

    setTheme(storedTheme);

    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = () => {
        const newSystemTheme = mediaQuery.matches ? 'dark' : 'light';
        setSystemTheme(newSystemTheme);
        if (themeState === 'system') {
          applyTheme('system', newSystemTheme);
        }
      };

      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, [applyTheme, defaultTheme, storageKey, themeState]);

  // Provide theme context
  const contextValue = React.useMemo(() => ({
    theme: themeState,
    setTheme,
    systemTheme,
  }), [themeState, setTheme, systemTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
