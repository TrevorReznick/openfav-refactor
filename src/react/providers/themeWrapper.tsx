import type { ReactNode } from 'react';
import { useEffect, useState, startTransition } from 'react';
import { useTheme } from '@/react/providers/themeProvider';
import { LoadingSpinner } from '@/react/components/common/LoadingSpinner';

export function ThemeWrapper({ children }: { children: ReactNode }) {
  const { theme, systemTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Set isClient to true after mount using startTransition
  useEffect(() => {
    startTransition(() => {
      setIsClient(true);
    });
  }, []);

  // Apply theme classes to the html element
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !isClient) return;
    
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
    
    // Mark as loaded after a small delay using startTransition
    const timer = setTimeout(() => {
      startTransition(() => {
        setIsLoading(false);
      });
    }, 50);
    
    return () => clearTimeout(timer);
  }, [theme, systemTheme, isClient]);

  // Show a minimal loading state that matches SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    );
  }

  // Only show loading spinner after client-side hydration is complete
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}
