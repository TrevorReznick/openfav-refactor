import type { ReactNode } from 'react';
import { useEffect, useState, startTransition } from 'react';
import { useTheme } from '@/react/providers/themeProvider';
import { LoadingSpinner } from '@/react/components/common/LoadingSpinner';

export function ThemeWrapper({ children }: { children: ReactNode }) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme classes to the html element
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    // Determine the current theme to apply
    const currentTheme = theme === 'system' ? (systemTheme || 'light') : theme;
    
    // Apply theme class and data-theme attribute
    if (currentTheme) {
      root.classList.add(currentTheme);
      root.setAttribute('data-theme', currentTheme);
      
      // Set CSS variables based on theme
      if (currentTheme === 'dark') {
        document.documentElement.style.setProperty('--background', 'hsl(222.2 84% 4.9%)');
        document.documentElement.style.setProperty('--foreground', 'hsl(210 40% 98%)');
      } else {
        document.documentElement.style.setProperty('--background', 'hsl(0 0% 100%)');
        document.documentElement.style.setProperty('--foreground', 'hsl(222.2 84% 4.9%)');
      }
    }
  }, [theme, systemTheme, mounted]);

  // Prevent hydration mismatch by not rendering different content on server vs client
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return <>{children}</>;
}
