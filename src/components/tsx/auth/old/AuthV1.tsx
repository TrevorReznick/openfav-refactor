import { useState } from 'react'
import { supabase } from "@/providers/supabaseAuth"
import { toast } from "sonner"
import { Github, Mail, LogIn } from "lucide-react"

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = '/';
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Password reset instructions sent to your email!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
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
            <label htmlFor="password" className="block text-sm font-medium mb-1">
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
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? 'Loading...' : (
              <>
                <Mail className="w-4 h-4" />
                {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative bg-secondary-light px-4 text-sm text-white/60">
            or continue with
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuthSignIn('github')}
            className="btn-secondary flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
          
          <button
            onClick={() => handleOAuthSignIn('google')}
            className="btn-secondary flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#fff" d="M12 5c1.617 0 3.077.571 4.184 1.52L19.59 3.5C17.5 1.33 14.931 0 12 0 7.392 0 3.374 2.665 1.332 6.667l3.674 2.787C6.082 6.709 8.829 5 12 5z"/>
              <path fill="#fff" d="M23.5 12.5H12v5h6.727c-.777 2.41-2.922 4-5.727 4-3.443 0-6.25-2.807-6.25-6.25S9.557 9 13 9c1.437 0 2.756.497 3.814 1.307l3.834-3.834C18.656 4.586 15.954 3 13 3 7.477 3 3 7.477 3 13s4.477 10 10 10c8.396 0 10-8 10-12 0-.273-.01-.5-.019-.5z"/>
            </svg>
            Google
          </button>
        </div>

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

export default Auth;