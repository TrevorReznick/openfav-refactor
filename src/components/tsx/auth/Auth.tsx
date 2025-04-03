
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/providers/supabaseAuth'
import { toast } from "sonner";

const AuthPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error;
        toast.success('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  };

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
