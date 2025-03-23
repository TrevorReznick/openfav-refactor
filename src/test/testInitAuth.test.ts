import { userStore, initializeAuth } from '@/store/authStore'
import { vi } from 'vitest'

vi.mock('@/providers/supabaseAuth.ts', () => ({
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
