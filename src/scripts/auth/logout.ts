import { userStore } from '@/store'
import { toast } from 'sonner'
import { supabase } from '@/providers/supabaseAuth'

interface LogoutOptions {
  /**
   * URL a cui reindirizzare dopo il logout
   * Se non specificato, non viene effettuato alcun reindirizzamento
   */
  redirectUrl?: string
  
  /**
   * Se mostrare un messaggio di notifica all'utente
   * @default true
   */
  notify?: boolean
  
  /**
   * Se effettuare il logout da Supabase
   * @default false
   */
  useSupabase?: boolean
  
  /**
   * Se cancellare i cookie di autenticazione
   * @default false
   */
  clearCookies?: boolean
  
  /**
   * Se cancellare i token di Supabase dal localStorage
   * @default false
   */
  clearSupabaseTokens?: boolean
}

/**
 * Funzione unificata per il logout con opzioni configurabili
 * Sostituisce tutte le precedenti implementazioni di logout
 */
export const logout = async (options: LogoutOptions = {}) => {
  const {
    redirectUrl = '/api/v1/auth/signout',
    notify = true,
    useSupabase = false,
    clearCookies = false,
    clearSupabaseTokens = false
  } = options

  try {
    // Effettua il logout da Supabase se richiesto
    if (useSupabase) {
      await supabase.auth.signOut()
    }

    // Pulisci lo store utente
    userStore.set({
      id: '',
      email: '',
      user_metadata: {},
      app_metadata: {},
      created_at: '',
      last_sign_in_at: new Date().toISOString(),
      exp: 0
    })

    // Pulisci i dati dal localStorage
    if (typeof window !== 'undefined') {
      // Rimuovi l'ID utente
      window.localStorage.removeItem('openfav-userId')
      
      // Pulisci i cookie se richiesto
      if (clearCookies) {
        document.cookie = 'token=; Max-Age=0; path=/;';
      }
      
      // Reindirizza se specificato
      if (redirectUrl) {
        window.location.href = redirectUrl
      }
    }

    // Mostra notifica di successo
    if (notify) {
      toast.success('Logout effettuato con successo')
    }
    
    return { success: true }
  } catch (error) {
    console.error('Errore durante il logout:', error)
    
    if (notify) {
      toast.error('Si è verificato un errore durante il logout')
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Errore sconosciuto durante il logout')
    }
  }
}

// Funzioni di compatibilità per mantenere la retrocompatibilità
export const handleSignOut = () => logout({ redirectUrl: '/api/v1/auth/signout' })
export const supabaseSignOut = () => logout({ useSupabase: true })
export const authContextSignOut = () => logout()
export const debugSignOut = () => logout({ 
  redirectUrl: '', 
  notify: false, 
  clearCookies: true, 
  clearSupabaseTokens: true 
})