import { atom, onMount, task } from 'nanostores'
import { supabase } from '@/providers/supabaseAuth'

export const userStore = atom<any>(null) // Stato dell'utente (null se non autenticato)

export const initializeAuth = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    userStore.set(session?.user ?? null) // Imposta lo stato dell'utente
  } catch (error) {
    console.error(
      "Errore durante l'inizializzazione dell'autenticazione:",
      error
    )
    userStore.set(null) // Assicurati che lo stato sia nullo in caso di errore
  }
}

// Funzione per ascoltare i cambiamenti di autenticazione
export const listenToAuthChanges = () => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    userStore.set(session?.user ?? null) // Aggiorna lo stato dell'utente
  })

  return () => subscription.unsubscribe() // Pulizia del listener
}
