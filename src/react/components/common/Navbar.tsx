'use client'

import { useState, useEffect } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { supabase } from '@/providers/supabaseAuth'
import { toast } from 'sonner'
import { Button } from '@/react/components/ui/button'
import { useNavigation as useNav } from '@/react/hooks/navigationContext'
import { useStore } from '@nanostores/react'
import { currentPath, userStore } from '@/store'
import { UserHelper } from '~/scripts/auth/getAuth'

interface NavItem {
  id: string
  href: string
  label: string
  requiresAuth?: boolean
  hideWhenAuthed?: boolean
}

// Create a safe hook for navigation that works on server and client
const useSafeNavigation = () => {
  try {
    return useNav()
  } catch (error) {
    return {
      navigate: (path: string) => {
        if (typeof window !== 'undefined') {
          window.location.href = path
        }
      },
      goBack: () => {
        if (typeof window !== 'undefined') {
          window.history.back()
        }
      },
      currentPath: typeof window !== 'undefined' ? window.location.pathname : '/'
    }
  }
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const user = useStore(userStore)
  const { navigate } = useSafeNavigation()
  const current = useStore(currentPath)
  const [userHelper] = useState(() => new UserHelper())
  
  useEffect(() => {
    setIsClient(true)
    const checkAuth = async () => {
      const authStatus = await userHelper.isAuthenticated()
      setIsAuthenticated(!!authStatus)
    }
    checkAuth()
  }, [userHelper])

  const navItems: NavItem[] = [
    { id: 'home', href: '/', label: 'Home' },
    { id: 'dashboard', href: '/dashboard', label: 'Dashboard', requiresAuth: true },
    { id: 'features', href: '#features', label: 'Features' },
    { id: 'how-it-works', href: '#how-it-works', label: 'How it works' },
    { id: 'about', href: '#about', label: 'About Us' },
    { id: 'contacts', href: '#contacts', label: 'Contacts' },
    { id: 'signin', href: '/signin', label: 'Sign In', hideWhenAuthed: true },
  ]

  const filteredNavItems = navItems.filter(item => {
    if (item.requiresAuth && !isAuthenticated) return false
    if (item.hideWhenAuthed && isAuthenticated) return false
    return true
  })

  const handleSignOut = async () => {
    if (typeof window === 'undefined') return
    
    try {
      await supabase.auth.signOut()
      userStore.set({
        id: '',
        email: '',
        user_metadata: {},
        app_metadata: {},
        created_at: '',
        last_sign_in_at: new Date().toISOString(),
        exp: 0
      })
      setIsAuthenticated(false)
      window.location.href = '/'
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
      console.error(error)
    }
  }

  if (!isClient) {
    return null // Don't render on server
  }

  return (
    <nav className="fixed w-full top-0 left-0 z-50 glass-card bg-secondary/30 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Openfav</h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map(item => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(item.href)
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
            {isAuthenticated ? (
              <Button 
                onClick={handleSignOut} 
                className="flex items-center gap-2"
                variant="ghost"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <button 
                onClick={() => navigate('/signin')}
                className="btn-primary"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden"
            variant="ghost"
            size="icon"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 space-y-4">
            {filteredNavItems.map(item => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(item.href)
                  setIsMenuOpen(false)
                }}
                className="block text-white/80 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
            {isAuthenticated ? (
              <Button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2"
                variant="ghost"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  navigate('/signin')
                  setIsMenuOpen(false)
                }} 
                className="w-full"
                variant="ghost"
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
