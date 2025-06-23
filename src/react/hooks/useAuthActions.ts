import { supabase } from '@/providers/supabaseAuth'
import { userStore } from '@/store'
import { toast } from 'sonner'

export const handleSignOut = async () => {
  if (typeof window === 'undefined') return false;
  
  try {
    await supabase.auth.signOut()
    userStore.set({
      id: '',
      email: '',
      user_metadata: {},
      app_metadata: {},
      created_at: '',
      last_sign_in_at: new Date().toISOString(),
      exp: 0
    })
    
    // Clear any additional storage if needed
    window.localStorage.removeItem('supabase.auth.token')
    
    // Redirect to logout endpoint
    window.location.href = '/api/v1/auth/signout'
    toast.success('Logged out successfully')
    return true
  } catch (error) {
    console.error('Logout error:', error)
    toast.error('Logout failed')
    return false
  }
}
