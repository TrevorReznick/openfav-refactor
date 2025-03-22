import { atom, onMount, task } from 'nanostores'
import { supabase } from '@/providers/supabaseAuth'

export const $user = atom<any>(null)
export const $loading = atom(true)

// Funzione per inizializzare l'autenticazione
export const initializeAuth = () => {
  onMount($user, () => {
    task(async () => {
      $loading.set(true)
      const { data } = await supabase.auth.getSession()
      $user.set(data.session?.user ?? null)
      $loading.set(false)
    })
  })
}
