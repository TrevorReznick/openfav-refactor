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
      console.log('[Logout] Effettuo il logout da Supabase')
      await supabase.auth.signOut()
      console.log('[Logout] Logout da Supabase completato')
    } else {
      console.log('[Logout] Salto il logout da Supabase (useSupabase=false)')
    }

    // Pulisci lo store utente
    console.log('[Logout] Pulizia dello store utente')
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
      console.log('[Logout] Pulizia del localStorage')
      // Rimuovi l'ID utente
      window.localStorage.removeItem('openfav-userId')
      
      // Pulisci i cookie se richiesto
      if (clearCookies) {
        console.log('[Logout] Pulizia dei cookie di autenticazione')
        document.cookie = 'token=; Max-Age=0; path=/;';
      } else {
        console.log('[Logout] Salto la pulizia dei cookie (clearCookies=false)')
      }
      
      // Reindirizza se specificato
      if (redirectUrl) {
        console.log(`[Logout] Reindirizzamento a: ${redirectUrl}`)
        window.location.href = redirectUrl
      } else {
        console.log('[Logout] Nessun reindirizzamento specificato')
      }
    }

    // Mostra notifica di successo
    if (notify) {
      console.log('[Logout] Mostro notifica di successo')
      toast.success('Logout effettuato con successo')
    } else {
      console.log('[Logout] Notifica disabilitata (notify=false)')
    }
    
    console.log('[Logout] Logout completato con successo')
    return { success: true }
  } catch (error) {
    console.error('[Logout] Errore durante il logout:', error)
    
    if (notify) {
      console.log('[Logout] Mostro notifica di errore')
      toast.error('Si è verificato un errore durante il logout')
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Errore sconosciuto durante il logout')
    }
  }
}

// Funzioni di compatibilità per mantenere la retrocompatibilità
export const handleSignOut = () => {
  console.log('[Logout] handleSignOut: Richiamata funzione di compatibilità')
  return logout({ redirectUrl: '/api/v1/auth/signout' })
}

export const supabaseSignOut = () => {
  console.log('[Logout] supabaseSignOut: Richiamata funzione di compatibilità')
  return logout({ useSupabase: true })
}

export const authContextSignOut = () => {
  console.log('[Logout] authContextSignOut: Richiamata funzione di compatibilità')
  return logout()
}

export const debugSignOut = () => {
  console.log('[Logout] debugSignOut: Esecuzione del debug di logout')
  return logout({
    useSupabase: true,
    notify: true,
    clearCookies: true,
    redirectUrl: '/'
  })
}