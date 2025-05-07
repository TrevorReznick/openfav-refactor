import { useState as local, useEffect as action } from 'react'
import { supabase } from '@/providers/supabaseAuth'
import { toast } from 'sonner'
import { useNavigation } from '@/hooks/NavigationContext'
import { useStore } from '@nanostores/react'
import { currentPath } from '@/store'

const AuthPage = () => {
  const [email, setEmail] = local('')
  const [password, setPassword] = local('')
  const [loading, setLoading] = local(false)
  const [isSignUp, setIsSignUp] = local(false)
  const { navigate } = useNavigation()
  const current = useStore(currentPath)

  // Debug: Monitor navigation state
  action(() => {
    console.group('🧭 Navigation Debug')
    console.log('Current path:', current)
    console.log('Window location:', window.location.pathname)
    console.groupEnd()
  }, [current])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.group('🔐 Auth Process')
      console.log('Attempting:', isSignUp ? 'signup' : 'signin')
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast.success('Check your email for the confirmation link!')
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        console.log('Auth successful, attempting navigation')
        
        // Force page reload after successful login
        window.location.href = '/build/auth-redirect'
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
      console.groupEnd()
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error;
      toast.success('Password reset instructions sent to your email!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-foreground">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-white/10 focus:border-primary focus:outline-none"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-white/10 focus:border-primary focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-white/80 hover:text-white text-sm"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        {!isSignUp && (
          <div className="text-center">
            <button
              onClick={handleResetPassword}
              className="text-white/80 hover:text-white text-sm"
              disabled={loading}
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage
