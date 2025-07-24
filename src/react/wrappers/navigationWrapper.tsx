'use client'

import { useEffect, useState } from 'react'
import { NavigationProvider } from '@/react/hooks/navigationContext'

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Ensure we're in the browser before rendering the NavigationProvider
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a fragment with the children during SSR
    return <>{children}</>
  }

  return <NavigationProvider>{children}</NavigationProvider>
}
