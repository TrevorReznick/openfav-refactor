import type { ReactNode } from 'react'
import { NavigationProvider } from '~/hooks/NavigationContext'

interface GenericCompProps {
  children?: ReactNode
}

const RouterAdapter = ({ children }: GenericCompProps) => {
  return (
    <NavigationProvider>
      {children}
    </NavigationProvider>
  )
}

export default RouterAdapter