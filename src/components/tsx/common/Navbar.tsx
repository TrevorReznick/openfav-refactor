import { useState, useEffect } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { supabase } from '@/providers/supabaseAuth'
import { toast } from 'sonner'
import { Button } from '@/components/tsx/ui/button'
import { useNavigation } from '~/hooks/NavigationContext'
import { useStore } from '@nanostores/react'
import { currentPath, previousPath } from '@/store'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { navigate } = useNavigation()
  
  // Debug: Router state
  const current = useStore(currentPath)
  const previous = useStore(previousPath)

  console.group('🏗️ Navbar Initialization')
  console.log('Initial render with props:', { navigate, current, previous })
  console.groupEnd()

  // Debug: Component lifecycle and router state
  /*
  useEffect(() => {
    console.group('🧭 Router Debug')
    console.log('Current path:', current)
    console.log('Previous path:', previous)
    console.log('Window location:', window.location.pathname)
    console.groupEnd()
  }, [current, previous])

  // Debug: Component mount
  useEffect(() => {
    console.group('🚀 Navbar Lifecycle')
    console.log('Component mounted')
    console.log('Initial window location:', window.location.pathname)
    return () => {
      console.log('Component unmounted')
      console.groupEnd()
    }
  }, [])
  */

  // Debug: Auth state
  useEffect(() => {
    console.group('🔐 Auth Debug')
    
    const setupAuth = async () => {
      console.log('Setting up auth listeners...')
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Initial session:', {
          user: session?.user?.email,
          timestamp: new Date().toISOString()
        })
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Session fetch error:', error)
      }
    }

    setupAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', {
          event,
          user: session?.user?.email,
          timestamp: new Date().toISOString()
        })
        setUser(session?.user ?? null)
      }
    )

    return () => {
      console.log('Cleaning up auth listeners')
      subscription.unsubscribe()
      console.groupEnd()
    }
  }, [])

  const handleSignOut = async () => {
    console.group('📤 Sign Out Process')
    try {
      console.log('Attempting sign out...')
      console.log('Current path before signout:', current)
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      console.log('Sign out successful')
      console.log('Navigating to /auth...')
      navigate('/auth')
      
      console.log('Navigation complete')
      console.log('New path:', window.location.pathname)
    } catch (error: any) {
      console.error('Sign out failed:', error)
      toast.error(error.message)
    }
    console.groupEnd()
  }

  // Debug: Mobile menu state
  useEffect(() => {
    console.log('📱 Mobile menu:', isOpen ? 'opened' : 'closed')
  }, [isOpen])

  return (
    <nav className="fixed w-full top-0 left-0 z-50 glass-card bg-secondary/30 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-foreground">Openfav</h1>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="text-white/80 hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="#"
              className="text-white/80 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="text-white/80 hover:text-white transition-colors"
            >
              How it works
            </a>
            <a
              href="#"
              className="text-white/80 hover:text-white transition-colors"
            >
              About Us
            </a>
            <a
              href="#"
              className="text-white/80 hover:text-white transition-colors"
            >
              Contacts
            </a>
            {user ? (
              <button 
                  onClick={handleSignOut}
                  className='btn-primary inline-flex items-center gap-2 px-4 py-2'
              >
                  <LogOut className="w-4 h-4" />
                  Sign Out
              </button>
            ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className='btn-primary'               
                >
                Sign In
              </button>
            )}
          </div>

          <Button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {isOpen && (
          <div className="md:hidden pt-4">
            <div className="flex flex-col space-y-4">
              <a
                href="/"
                className="text-white/80 hover:text-white transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                How it works
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                About Us
              </a>
              <a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
              >
                Contacts
              </a>
              {user ? (
                <Button
                  onClick={handleSignOut}
                  className="btn-secondary flex items-center gap-2 justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="btn-primary w-full"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
