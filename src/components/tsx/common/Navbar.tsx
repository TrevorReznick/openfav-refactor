import { useState, useEffect } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { supabase } from '@/providers/supabaseAuth'
import { toast } from 'sonner'
import { Button } from '@/components/tsx/ui/button'
import { useNavigation } from '~/hooks/NavigationContext'
import { useStore } from '@nanostores/react'
import { currentPath, userStore } from '@/store'
import { setupAuth } from '~/scripts/authUtils'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const user = useStore(userStore)
  const { navigate } = useNavigation()
  const current = useStore(currentPath)

  useEffect(() => {
    const initializeAuth = async () => {
      await setupAuth()
    }
    initializeAuth()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      navigate('/api/v1/auth/signout')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
      console.error(error)
    }
  }

  const navLinks = [
    { id: 'home', href: '/', label: 'Home' },
    { id: 'features', href: '#features', label: 'Features' },
    { id: 'how-it-works', href: '#how-it-works', label: 'How it works' },
    { id: 'about', href: '#about', label: 'About Us' },
    { id: 'contacts', href: '#contacts', label: 'Contacts' },
  ]

  return (
    <nav className="fixed w-full top-0 left-0 z-50 glass-card bg-secondary/30 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Openfav</h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={link.href}
                className="text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <Button onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 space-y-4">
            {navLinks.map(link => (
              <a
                key={link.id}
                href={link.href}
                className="block text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <Button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')} className="w-full">
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