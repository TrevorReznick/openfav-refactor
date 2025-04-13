import React, { useState, Suspense } from 'react'
import { toast } from 'sonner'

const AuthPage = () => {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  // Al submit, impostiamo lo state di loading (non evitiamo il comportamento HTML)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    // Non facciamo e.preventDefault() così il form viene inviato in maniera tradizionale
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-foreground">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <Suspense fallback={<div className="p-4 text-center">Submitting...</div>}>
          <form
            method="POST"
            action="/api/v1/auth/signin"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-white/10 focus:border-primary focus:outline-none"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-white/10 focus:border-primary focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Submitting...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
        </Suspense>
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
      </div>
    </div>
  )
}

export default AuthPage