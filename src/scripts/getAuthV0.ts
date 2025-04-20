import { supabase } from '@/providers/supabaseAuth'
import { currentPath } from '@/store'

export const authGuard = async (): Promise<boolean> => {
  console.group('🔒 Auth Guard')
  try {
    const response = await fetch('/api/v1/auth/signin', {
      method: 'GET',
      credentials: 'include' // importante per includere i cookies
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    console.log('Client Session object:', data.session)
    console.log('Client Session check:', {
      isAuthenticated: !!data.session,
      currentPath: currentPath.get()
    })
    return !!data.session;
  } catch (error) {
    console.error('Auth Guard error:', error)
    return false;
  } finally {
    console.groupEnd()
  }
}