import { userStore } from '@/store'
import { UserHelper } from '~/scripts/getAuth'

// Cache dell'istanza per ottimizzazione
const authHelper = UserHelper.getInstance()

console.log('hello from auth utils!')

/**
 * Setup dell'autenticazione dell'applicazione
 * - Recupera la sessione completa
 * - Aggiorna lo store di autenticazione
 * - Gestisce gli errori di autenticazione
 */
export const setupAuth = async (): Promise<boolean> => {

  console.groupCollapsed('🔐 Setup Auth') // Usiamo groupCollapsed per meno clutter
  
  try {

    console.log('hello from setupAuth!')

    console.time('⏱️ Session fetch') // Benchmark prestazioni

    const completeSession = await authHelper.getCompleteSession()

    console.log('Raw session:', JSON.stringify(completeSession, null, 2))
    
    console.timeEnd('⏱️ Session fetch')
    console.debug('Session data:', completeSession)

    console.warn('isTokenExpired', authHelper.isTokenExpired())

    if (!completeSession.isAuthenticated) {
      console.warn('⚠️ No valid session found')
      userStore.set(null)
      return false
    }

    // Validazione aggiuntiva dei dati critici
    if (!completeSession.tokens?.accessToken) {
      console.error('❌ Invalid session: missing access token')
      userStore.set(null)
      return false
    }

    userStore.set(completeSession)
    console.info(`✅ Authenticated as ${completeSession.email}`)
    return true

  } catch (error) {
    console.error('❌ Auth setup failed:', error)
    
    // Potremmo differenziare gli errori qui
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    
    userStore.set(null)
    return false
    
  } finally {
    console.log('final store user check:', userStore.get())
    console.groupEnd()
    
    // Eventuale pulizia o notifiche UI potrebbero andare qui
  }
}

// Utility per uso immediato in app initialization
export const initializeAuth = async () => {
  const success = await setupAuth()
  return { 
    isAuthenticated: success,
    retry: () => initializeAuth() // Per eventuali tentativi successivi
  }
}