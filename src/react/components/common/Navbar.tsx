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

// Create a safe hook for navigation that works on server and client
const useSafeNavigation = () => {
  try {
    // Try to use the navigation context if available
    return useNav()
  } catch (error) {
    // Fallback to basic navigation if context is not available
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

interface NavItem {
  name: string
  href: string
  requiresAuth?: boolean
  hideWhenAuthed?: boolean
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const user = useStore(userStore)
  const { navigate, currentPath: navCurrentPath } = useSafeNavigation()
  const current = useStore(currentPath)
  const [userHelper] = useState(() => new UserHelper())
  const [isClient, setIsClient] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    const checkAuth = async () => {
      const authStatus = await userHelper.isAuthenticated()
      setIsAuthenticated(!!authStatus)
    }
    checkAuth()
  }, [userHelper])

  const navItems: NavItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard', requiresAuth: true },
    { name: 'Sign In', href: '/signin', hideWhenAuthed: true },
  ]

  const filteredNavItems = navItems.filter(item => {
    if (item.requiresAuth && !isAuthenticated) return false
    if (item.hideWhenAuthed && isAuthenticated) return false
    return true
  })

  useEffect(() => {
    // Initialize auth state
    const checkAuth = async () => {
      const isAuth = userHelper.isAuthenticated()
      console.log('Initial auth check:', { isAuth, user })
    }
    
    checkAuth()
  }, [userHelper, user])

  const handleSignOut = async () => {
    if (typeof window === 'undefined') return
    
    try {
      await supabase.auth.signOut()
      // Clear local user state by setting an empty user
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
      navigate('/')
      // Redirect to home page
      window.location.href = '/'
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
      console.error(error)
    }
  }

  const goToPage = () =>{
    window.location.href = '/api/v1/auth/signout'
  }

  const navLinks = [
    { id: 'home', href: '/', label: 'Home' },
    { id: 'features', href: '#features', label: 'Features' },
    { id: 'how-it-works', href: '#how-it-works', label: 'How it works' },
    { id: 'about', href: '#about', label: 'About Us' },
    { id: 'contacts', href: '#contacts', label: 'Contacts' },
  ]

  if (!isClient) {
    return null // Don't render on server
  }

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
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
        
        <div className="flex md:order-2">
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Sign In
            </button>
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
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`block py-2 pl-3 pr-4 ${
                    current === item.href
                      ? 'text-blue-700 dark:text-white bg-blue-700/10 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500'
                      : 'text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700'
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(item.href)
                  }}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar