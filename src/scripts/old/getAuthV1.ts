import { supabase } from '@/providers/supabaseAuth'
import { currentPath } from '@/store'

export const authGuard = async (): Promise<boolean> => {
  console.group('🔒 Auth Guard')
  try {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session object:', session)
    console.log('Session check:', {
      isAuthenticated: !!session,
      currentPath: currentPath.get()
    })
    return true
  } catch (error) {
    console.error('Auth Guard error:', error)
    return false
  } finally {
    console.groupEnd()
  }
}

// Routes protette che richiedono autenticazione
/*
const protectedRoutes = ['/', '/dashboard', '/test/test']
const currentRoute = currentPath.get()

if (protectedRoutes.includes(currentRoute) && !session) {
  console.log('Unauthorized access, redirecting to /auth')
  window.location.href = '/auth'
    return false
}
    
if (currentRoute === '/auth' && session) {
  console.log('Already authenticated, redirecting to /')
  window.location.href = '/'
  return false
}


    