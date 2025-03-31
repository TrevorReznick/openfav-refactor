import { useState, useEffect } from 'react'
import { Menu, LogOut } from 'lucide-react'
import { supabase } from '@/providers/supabaseAuth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/tsx/theme-toggle'
import { Button } from '@/components/tsx/ui/button'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/auth')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <nav className="fixed w-full top-0 z-50 glass-card bg-secondary-light/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Openfav</h1>
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
              <Button 
                  onClick={handleSignOut}
                  variant="secondary"
                  className="flex items-center gap-2 rounded"
              >
                  <LogOut className="w-4 h-4" />
                  Sign Out
              </Button>
            ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  variant="default"
                  size="lg"
                  className="btn-primary flex items-center gap-2"


                
                >
                Sign In
              </Button>
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
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
