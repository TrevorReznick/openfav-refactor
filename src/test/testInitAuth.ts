import { userStore, initializeAuth } from '@/stores/authStore'
import { vi } from 'vitest'

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: '123', email: 'test@example.com' } } },
      }),
    },
  },
}))

test("initializeAuth imposta correttamente lo stato dell'utente", async () => {
  await initializeAuth()
  expect(userStore.get()).toEqual({ id: '123', email: 'test@example.com' })
})
