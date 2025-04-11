import { supabase } from '@/providers/supabaseAuth'
import { currentPath } from '@/store'

export const authMiddleware = async () => {
  console.group('🔒 Auth Middleware')
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session check:', {
      isAuthenticated: !!session,
      currentPath: currentPath.get()
    })

    // Protected routes that require authentication
    const protectedRoutes = ['/', '/dashboard', '/profile']
    const currentRoute = currentPath.get()

    if (protectedRoutes.includes(currentRoute) && !session) {
      console.log('Unauthorized access, redirecting to /auth')
      window.location.href = '/auth'
      return false
    }

    if (currentRoute === '/auth' && session) {
      console.log('Already authenticated, redirecting to home')
      window.location.href = '/'
      return false
    }

    return true
  } catch (error) {
    console.error('Middleware error:', error)
    return false
  } finally {
    console.groupEnd()
  }
}