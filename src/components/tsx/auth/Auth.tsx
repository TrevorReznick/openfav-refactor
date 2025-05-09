import React, { useState } from 'react'
import { GitFork } from 'lucide-react'
import { toast } from 'sonner'

const AuthPage = () => {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    // Il comportamento predefinito verrà gestito dal server
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-foreground">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>

        <form
          method="POST"
          action="/api/v1/auth/signin"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Email e Password visibili solo per Sign In/Up */}
          {!isSignUp && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required={!isSignUp}
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
                  name="password"
                  type="password"
                  required={!isSignUp}
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-white/10 focus:border-primary focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          {/* Submit button per email/password */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
            name={isSignUp ? "provider" : undefined}
            value={isSignUp ? "credentials" : undefined}
          >
            {loading ? 'Submitting...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            type="button"
            className="text-white/80 hover:text-white text-sm"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative bg-secondary-light px-4 text-sm text-white/60">
            or continue with
          </div>
        </div>

        {/* Form separato per provider OAuth */}
        <div className="grid grid-cols-2 gap-3">
          <form method="POST" action="/api/v1/auth/signin" className="contents">
            <button
              type="submit"
              name="provider"
              value="github"
              disabled={loading}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <GitFork className="w-4 h-4" />
              GitHub
            </button>
          </form>

          <form method="POST" action="/api/v1/auth/signin" className="contents">
            <button
              type="submit"
              name="provider"
              value="google"
              disabled={loading}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#fff" d="M12 5c1.617 0 3.077.571 4.184 1.52L19.59 3.5C17.5 1.33 14.931 0 12 0 7.392 0 3.374 2.665 1.332 6.667l3.674 2.787C6.082 6.709 8.829 5 12 5z"/>
                <path fill="#fff" d="M23.5 12.5H12v5h6.727c-.777 2.41-2.922 4-5.727 4-3.443 0-6.25-2.807-6.25-6.25S9.557 9 13 9c1.437 0 2.756.497 3.814 1.307l3.834-3.834C18.656 4.586 15.954 3 13 3 7.477 3 3 7.477 3 13s4.477 10 10 10c8.396 0 10-8 10-12 0-.273-.01-.5-.019-.5z"/>
              </svg>
              Google
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AuthPage