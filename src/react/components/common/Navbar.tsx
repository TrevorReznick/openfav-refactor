'use client'

import { useState, useEffect } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/react/components/ui/button'
import { useNavigation as useNav } from '@/react/hooks/navigationContext'
import { useStore } from '@nanostores/react'
import { currentPath, userStore } from '@/store'
import { UserHelper } from '~/scripts/auth/getAuth'
import { ThemeToggle } from './ThemeToggle'
import { handleSignOut } from '@/scripts/auth/utils'

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

  const handleSignOutClick = async () => {
    const success = await handleSignOut()
    if (success) {
      setIsAuthenticated(false)
    }
  }

  if (!isClient) {
    return null // Don't render on server
  }

  return (
    <nav className="fixed w-full top-0 left-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a 
          href="/" 
          className="flex items-center"
          onClick={(e) => {
            e.preventDefault()
            navigate('/')
          }}
        >
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            OpenFav
          </span>
        </a>
        
        <div className="flex items-center space-x-4 md:order-2">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={handleSignOutClick}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <a
                href="/build/login"
                className="hidden md:inline-flex items-center px-5 py-2.5 text-base font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
              >
                Sign Up
              </a>
            </>
          )}
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded={isMenuOpen}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
            isMenuOpen ? 'block' : 'hidden'
          }`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            {filteredNavItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={`block py-2 pl-3 pr-4 ${
                    current === item.href
                      ? 'text-blue-700 dark:text-white bg-blue-50 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500'
                      : 'text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(item.href)
                    setIsMenuOpen(false)
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
            
            {/* Mobile auth buttons */}
            {isAuthenticated ? (
              <li className="md:hidden">
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-left py-2 pl-3 pr-4 text-red-600 hover:bg-red-50 rounded md:hover:bg-transparent md:border-0 md:hover:text-red-700 md:p-0 dark:text-red-400 md:dark:hover:text-red-500 dark:hover:bg-red-900/30"
                >
                  Sign Out
                </button>
              </li>
            ) : (
              <li className="md:hidden">
                <a
                  href="/signup"
                  className="block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/signup')
                    setIsMenuOpen(false)
                  }}
                >
                  Sign Up
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
