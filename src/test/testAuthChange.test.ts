import { userStore, listenToAuthChanges } from '../store/authStore'
import { vi } from 'vitest'

vi.mock('@/providers/supabaseAuth.ts', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((callback) => {
        callback('SIGNED_IN', { user: { id: '456', email: 'new@example.com' } })
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
    },
  },
}))

test("listenToAuthChanges aggiorna correttamente lo stato dell'utente", () => {
  listenToAuthChanges()
  expect(userStore.get()).toEqual({ id: '456', email: 'new@example.com' })
})
