import type { FC } from 'react'
import DynamicWrapper from '@/components/tsx/builders/DynamicWrapper'
import { NavigationProvider } from '@/hooks/NavigationContext'
import { ThemeProvider } from '@/components/tsx/theme-provider'
import Navbar from '@/components/tsx/common/Navbar'

const providers = [ThemeProvider, NavigationProvider]

const AppClient: FC = () => {
  return (
    <DynamicWrapper providers={providers}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {/* Other components that need context access */}
        </main>
      </div>
    </DynamicWrapper>
  )
}

export default AppClient