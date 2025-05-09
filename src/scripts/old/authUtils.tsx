import { userStore } from '@/store'
import { UserHelper } from '~/scripts/getAuth'

const auth = UserHelper.getInstance()

export const setupAuth = async () => {
  console.group('🚀 SetupAuth Avviato')
  try {
    // 1. Ottieni sessione completa da UserHelper
    const completeSession = await auth.getCompleteSession()
    console.log('Sessione ottenuta:', completeSession)

    // 2. Aggiorna lo store con i dati completi
    if (completeSession.isAuthenticated) {
      userStore.set(completeSession)
      console.log('Utente autenticato:', completeSession.email)
    } else {
      userStore.set(null)
      console.warn('Nessuna sessione valida trovata')
    }

  } catch (error) {
    console.error('🚨 Errore durante l\'autenticazione:', error)
    userStore.set(null)
  } finally {
    console.groupEnd()
  }
}