import { useCallback, useEffect, useState } from 'react'
import { themeStore } from '@/store'
import { useStore } from '@nanostores/react'

type Theme = 'dark' | 'light' | 'system'

export function useTheme() {
  const { theme, systemTheme } = useStore(themeStore)
  const [mounted, setMounted] = useState(false)

  const setTheme = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      themeStore.set({ 
        ...themeStore.get(),
        theme: newTheme, 
        systemTheme 
      })
    } else {
      root.classList.add(newTheme)
      themeStore.set({
        ...themeStore.get(),
        theme: newTheme
      })
    }

    localStorage.setItem('ui-theme', newTheme)
  }, [])

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('ui-theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [setTheme])

  // Handle system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const newSystemTheme = mediaQuery.matches ? 'dark' : 'light'
      root.classList.remove('light', 'dark')
      root.classList.add(newSystemTheme)
      themeStore.set({
        ...themeStore.get(),
        systemTheme: newSystemTheme
      })
    }

    const root = window.document.documentElement
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return {
    theme,
    systemTheme,
    setTheme,
    mounted,
    isDark: theme === 'system' ? systemTheme === 'dark' : theme === 'dark',
  }
}
