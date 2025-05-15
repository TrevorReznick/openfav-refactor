import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { UserHelper } from '@/scripts/getAuth'
import { userStore } from '@/store'

// Mock delle dipendenze
vi.mock('@/store', () => ({
  userStore: {
    get: vi.fn(),
    set: vi.fn()
  }
}))

// Mock di fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockUserSession = {
  id: 'user-123',
  email: 'test@example.com',
  fullName: 'Test User',
  createdAt: new Date(),
  lastLogin: new Date(),
  isAuthenticated: true,
  provider: 'email' as const,
  tokens: {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresAt: Math.floor(Date.now() / 1000) + 3600 // Scade tra 1 ora
  },
  metadata: {
    provider: 'email' as const,
    avatarUrl: 'https://example.com/avatar.jpg',
    githubUsername: 'testuser'
  }
}

describe('UserHelper', () => {
  let userHelper: UserHelper

  beforeAll(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
    
    // Setup default mock implementations
    mockFetch.mockReset()
    vi.mocked(userStore.get).mockReset()
    vi.mocked(userStore.set).mockReset()
  })

  beforeEach(() => {
    userHelper = UserHelper.getInstance()
  })

  describe('getCompleteSession', () => {
    it('dovrebbe restituire la sessione dallo store se valida', async () => {
      // Mock dello store locale con sessione valida
      vi.mocked(userStore.get).mockReturnValue(mockUserSession)
      
      const session = await userHelper.getCompleteSession()
      
      expect(session).toEqual(mockUserSession)
      expect(fetch).not.toHaveBeenCalled() // Non dovrebbe fare chiamate di rete
    })

    it('dovrebbe recuperare la sessione da Redis se quella locale è scaduta', async () => {
      // Mock dello store locale con sessione scaduta
      const expiredUser = {
        ...mockUserSession,
        tokens: {
          ...mockUserSession.tokens,
          expiresAt: Math.floor(Date.now() / 1000) - 3600 // Scaduta 1 ora fa
        }
      }
      vi.mocked(userStore.get).mockReturnValue(expiredUser)
      
      // Mock della risposta di Redis
      const mockRedisResponse = {
        ok: true,
        json: async () => ({
          session: {
            ...mockUserSession,
            tokens: {
              ...mockUserSession.tokens,
              expiresAt: Math.floor(Date.now() / 1000) + 7200 // Nuova scadenza
            }
          }
        })
      }
      mockFetch.mockResolvedValueOnce({
        ...mockRedisResponse,
        json: () => Promise.resolve(mockRedisResponse.json())
      } as Response)
      
      const session = await userHelper.getCompleteSession()
      
      expect(session).toBeDefined()
      expect(session?.tokens.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000))
      // Check that fetch was called with the expected URL and method
      const fetchCalls = mockFetch.mock.calls
      const sessionCall = fetchCalls.find(([url]) => 
        url.includes('/session/user_session_user-123')
      )
      expect(sessionCall).toBeDefined()
      expect(sessionCall?.[1]?.method).toBe('GET')
    })

    it('dovrebbe richiedere una nuova sessione se Redis non ha dati validi', async () => {
      // Mock dello store locale con sessione scaduta
      vi.mocked(userStore.get).mockReturnValue({
        ...mockUserSession,
        tokens: { ...mockUserSession.tokens, expiresAt: 0 }
      })
      
      // Mock della risposta vuota da Redis
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ session: null })
      } as Response)
      
      // Mock della risposta per getSessionTokens
      const mockSessionResponse = {
        ok: true,
        json: async () => ({ user: mockUserSession })
      }
      mockFetch.mockResolvedValueOnce({
        ...mockSessionResponse,
        json: () => Promise.resolve(mockSessionResponse.json())
      } as Response)
      
      // Mock per il salvataggio in Redis
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)
      
      const session = await userHelper.getCompleteSession()
      
      expect(session).toBeDefined()
      // Check that we got a valid session back
      expect(session).toBeDefined()
      expect(session?.isAuthenticated).toBe(true)
      // Verify userStore.set was called with a session object
      expect(userStore.set).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user-123',
        email: 'test@example.com',
        isAuthenticated: true
      }))
    })

    it('dovrebbe gestire gli errori durante il recupero da Redis', async () => {
      vi.mocked(userStore.get).mockReturnValue({
        ...mockUserSession,
        tokens: { ...mockUserSession.tokens, expiresAt: 0 }
      })
      mockFetch.mockRejectedValueOnce(new Error('Errore di rete'))
      
      // Verifichiamo che l'errore venga gestito e venga restituito l'utente vuoto
      const session = await userHelper.getCompleteSession()
      expect(session.isAuthenticated).toBe(false)
    })
  })

  describe('saveSessionToRedis', () => {
    it('dovrebbe salvare correttamente la sessione su Redis', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      } as Response)
      
      const result = await userHelper.saveSessionToRedis('user-123', mockUserSession)
      
      expect(result).toBe(true)
      // Check that set-session was called with the right data
      const setSessionCalls = mockFetch.mock.calls.filter(([url]) => 
        url.includes('/set-session')
      )
      
      expect(setSessionCalls.length).toBeGreaterThan(0)
      const [url, options] = setSessionCalls[0]
      expect(url).toContain('/set-session')
      expect(options?.method).toBe('POST')
      expect(options?.headers).toEqual(expect.objectContaining({
        'Content-Type': 'application/json'
      }))
      
      // Verify the request body
      const body = JSON.parse(options?.body || '{}')
      expect(body).toMatchObject({
        session: expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com'
        })
      })
    })
  })
})