import * as React from 'react';
import { map } from 'nanostores';
import { useStore } from '@nanostores/react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  systemTheme: Theme | undefined;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  systemTheme: undefined,
};

// Sostituisci createStore con map
export const themeStore = map<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  ...props
}: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  const setTheme = React.useCallback(
    (theme: Theme) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light';

        root.classList.add(systemTheme);
        // Aggiorna lo store usando set di nanostores map
        themeStore.set({ theme, systemTheme });
      } else {
        root.classList.add(theme);
        // Aggiorna lo store mantenendo systemTheme
        themeStore.setKey('theme', theme);
      }

      localStorage.setItem(storageKey, theme);
    },
    [storageKey]
  );

  React.useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    setTheme(savedTheme || defaultTheme);
    setMounted(true);
  }, [defaultTheme, setTheme, storageKey]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      // Leggi dallo store usando get di nanostores map
      const currentTheme = themeStore.get().theme;
      if (currentTheme === 'system') {
        setTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
