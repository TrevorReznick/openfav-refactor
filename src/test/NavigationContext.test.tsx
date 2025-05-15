import { render, act, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast } from 'sonner'
import { UserHelper } from '@/utils/UserHelper'
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext'
import { currentPath, previousPath } from '@/store'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

// Mock store
const mockStore = {
  currentPath: {
    set: vi.fn(),
    get: vi.fn(() => '/'),
  },
  previousPath: {
    set: vi.fn(),
    get: vi.fn(() => ''),
  },
}

vi.mock('@/store', () => mockStore)

// Mock UserHelper
const mockAuthHelper = {
  getCompleteSession: vi.fn(),
  isTokenExpired: vi.fn(),
}

vi.mock('@/utils/UserHelper', () => ({
  UserHelper: {
    getInstance: vi.fn(() => mockAuthHelper),
  },
}))

interface Session {
  isAuthenticated: boolean
}

const TestComponent = () => {
  const { navigate, goBack, checkAuth } = useNavigation()
  return (
    <div>
      <button onClick={() => navigate('/test')}>Navigate</button>
      <button onClick={goBack}>Go Back</button>
      <button onClick={checkAuth}>Check Auth</button>
      <span data-testid="current-path">{currentPath.get()}</span>
    </div>
  )
}

describe('NavigationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.currentPath.get.mockReturnValue('/')
    mockStore.previousPath.get.mockReturnValue('')
  })

  it('syncs current path with window location on mount', () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    expect(mockStore.currentPath.get).toHaveBeenCalled()
    expect(screen.getByTestId('current-path')).toHaveTextContent('/')
  })

  it('updates currentPath and previousPath on navigation', async () => {
    mockAuthHelper.getCompleteSession.mockResolvedValue({ isAuthenticated: true } as Session)
    mockAuthHelper.isTokenExpired.mockReturnValue(false)

    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    const navigateButton = screen.getByText('Navigate')
    await act(async () => {
      fireEvent.click(navigateButton)
    })

    expect(mockStore.previousPath.set).toHaveBeenCalledWith('/')
    expect(mockStore.currentPath.set).toHaveBeenCalledWith('/test')
  })

  it('handles goBack navigation', async () => {
    mockAuthHelper.getCompleteSession.mockResolvedValue({ isAuthenticated: true } as Session)
    mockAuthHelper.isTokenExpired.mockReturnValue(false)
    mockStore.previousPath.get.mockReturnValue('/previous')

    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    const goBackButton = screen.getByText('Go Back')
    await act(async () => {
      fireEvent.click(goBackButton)
    })

    expect(mockStore.currentPath.set).toHaveBeenCalledWith('/previous')
  })

  it('shows error toast when session is expired', async () => {
    mockAuthHelper.isTokenExpired.mockReturnValue(true)
    mockAuthHelper.getCompleteSession.mockResolvedValue({ isAuthenticated: false } as Session)

    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    const checkAuthButton = screen.getByText('Check Auth')
    await act(async () => {
      fireEvent.click(checkAuthButton)
    })

    expect(toast.error).toHaveBeenCalledWith('Session expired. Please log in again.')
  })

  it('allows navigation when session is valid', async () => {
    mockAuthHelper.isTokenExpired.mockReturnValue(false)
    mockAuthHelper.getCompleteSession.mockResolvedValue({ isAuthenticated: true } as Session)

    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    const checkAuthButton = screen.getByText('Check Auth')
    await act(async () => {
      fireEvent.click(checkAuthButton)
    })

    expect(toast.error).not.toHaveBeenCalled()
  })

  it('blocks navigation if user is not authenticated', async () => {
    mockAuthHelper.getCompleteSession.mockResolvedValue({ isAuthenticated: false } as Session)

    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    const navigateButton = screen.getByText('Navigate')
    await act(async () => {
      fireEvent.click(navigateButton)
    })

    expect(toast.error).toHaveBeenCalledWith('Session expired. Please log in again.')
    expect(mockStore.currentPath.set).not.toHaveBeenCalled()
    expect(mockStore.previousPath.set).not.toHaveBeenCalled()
  })

  it('handles navigation errors', async () => {
    const originalError = console.error
    console.error = vi.fn()

    mockStore.currentPath.set.mockImplementation(() => {
      throw new Error('Navigation error')
    })

    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    const navigateButton = screen.getByText('Navigate')
    await act(async () => {
      fireEvent.click(navigateButton)
    })

    expect(toast.error).toHaveBeenCalledWith('Navigation error')
    console.error = originalError
  })
})

describe('NavigationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.currentPath.get.mockReturnValue('/')
    mockStore.previousPath.get.mockReturnValue('')
  })

  it('should sync currentPath with window location on mount', () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    expect(currentPath.set).toHaveBeenCalledWith(window.location.pathname)
  })

  it('should update current and previous paths on navigate', async () => {
    vi.mocked(mockAuthHelper.getCompleteSession).mockResolvedValue({ isAuthenticated: true })
    vi.mocked(mockAuthHelper.isTokenExpired).mockReturnValue(false)

    const { getByText } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    await act(async () => {
      getByText('Navigate').click()
    })

    expect(currentPath.set).toHaveBeenCalledWith('/test')
    expect(previousPath.set).toHaveBeenCalledWith('/')
  })

  it('should go back to previous path', async () => {
    vi.mocked(mockAuthHelper.getCompleteSession).mockResolvedValue({ isAuthenticated: true })
    vi.mocked(mockAuthHelper.isTokenExpired).mockReturnValue(false)
    vi.mocked(previousPath.get).mockReturnValue('/previous')

    const { getByText } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    await act(async () => {
      getByText('Go Back').click()
    })

    expect(currentPath.set).toHaveBeenCalledWith('/previous')
  })

  it('should check auth and show error if not authenticated', async () => {
    vi.mocked(mockAuthHelper.getCompleteSession).mockResolvedValue({ isAuthenticated: false })
    vi.mocked(mockAuthHelper.isTokenExpired).mockReturnValue(false)

    const { getByText } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    await act(async () => {
      getByText('Check Auth').click()
    })

    expect(toast.error).toHaveBeenCalledWith('Not authenticated')
  })

  it('should check auth and show error if token expired', async () => {
    vi.mocked(mockAuthHelper.getCompleteSession).mockResolvedValue({ isAuthenticated: true })
    vi.mocked(mockAuthHelper.isTokenExpired).mockReturnValue(true)

    const { getByText } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    )

    await act(async () => {
      getByText('Check Auth').click()
    })

    expect(toast.error).toHaveBeenCalledWith('Session expired')
  })

  it('should call toast.error on navigation error', async () => {
    // Mock the navigate function to throw an error
    const originalError = console.error
    console.error = vi.fn()
    
    mockStore.currentPath.set.mockImplementation(() => {
      throw new Error('Navigation error')
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Go Back').click()
        })

        expect(mockCurrentPath.set).toHaveBeenCalledWith('/previous')
    })

    it('should check auth and show error if not authenticated', async () => {
        vi.mocked(authHelperMock.getCompleteSession).mockResolvedValue({ isAuthenticated: false })
        vi.mocked(authHelperMock.isTokenExpired).mockReturnValue(false)

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Check Auth').click()
        })

        expect(toast.error).toHaveBeenCalledWith('Not authenticated')
    })

    it('should check auth and show error if token expired', async () => {
        vi.mocked(authHelperMock.getCompleteSession).mockResolvedValue({ isAuthenticated: true })
        vi.mocked(authHelperMock.isTokenExpired).mockReturnValue(true)

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Check Auth').click()
        })

        expect(toast.error).toHaveBeenCalledWith('Session expired')
    })

        expect(mockCurrentPath.set).toHaveBeenCalledWith('/test')
        expect(mockPreviousPath.set).toHaveBeenCalledWith('/')
    })

    it('should block navigation if user is not authenticated', async () => {
        authHelperMock.getCompleteSession.mockResolvedValue({ isAuthenticated: false })

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Navigate').click()
        })

        expect(toast.error).toHaveBeenCalledWith('Please login to access this page')
        expect(mockCurrentPath.set).toHaveBeenCalledWith('/login')
    })

    it('should call toast.error on navigation error', async () => {
        // Mock the navigate function to throw an error
        const originalError = console.error
        console.error = vi.fn()
        
        mockCurrentPath.set.mockImplementation(() => {
            throw new Error('Navigation error')
        })

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Navigate').click()
        })

        expect(toast.error).toHaveBeenCalledWith('Navigation error')
        console.error = originalError
    })

    it('should handle goBack', async () => {
        // Mock previousPath to return a valid path
        mockPreviousPath.get.mockReturnValue('/previous')
        
        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Go Back').click()
        })

        expect(mockCurrentPath.set).toHaveBeenCalledWith('/previous')
        expect(mockPreviousPath.set).toHaveBeenCalledWith('/')
    })
})
             RUN  v3.0.9 /home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor
                  Coverage enabled with istanbul
            
            stdout | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe restituire la sessione dallo store se valida
            [Auth] Inizio recupero sessione completa 
            [Auth] Utente nello store locale user-123
            [UserHelper] isTokenExpired: false
            [Auth] Trovata sessione valida nello store locale 
            
            stdout | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe recuperare la sessione da Redis se quella locale è scaduta
            [Auth] Inizio recupero sessione completa 
            [Auth] Utente nello store locale user-123
            [UserHelper] isTokenExpired: true
            [Auth] Tentativo di recupero sessione da Redis { userId: 'user-123' }
            [UserHelper] getSessionFromRedis
            
            stdout | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe recuperare la sessione da Redis se quella locale è scaduta
            Session retrieved from Redis: {
              session: {
                id: 'user-123',
                email: 'test@example.com',
                fullName: 'Test User',
                createdAt: 2025-05-15T16:55:08.671Z,
                lastLogin: 2025-05-15T16:55:08.671Z,
                isAuthenticated: true,
                provider: 'email',
                tokens: {
                  accessToken: 'test-access-token',
                  refreshToken: 'test-refresh-token',
                  expiresAt: 1747335308
                },
                metadata: {
                  provider: 'email',
                  avatarUrl: 'https://example.com/avatar.jpg',
                  githubUsername: 'testuser'
                }
              }
            }
            
            stdout | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe recuperare la sessione da Redis se quella locale è scaduta
            [UserHelper] isTokenExpired: false
            [Auth] Sessione recuperata da Redis con successo { userId: 'user-123', expiresAt: 1747335308 }
            
            stdout | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe richiedere una nuova sessione se Redis non ha dati validi
            [Auth] Inizio recupero sessione completa 
            [Auth] Utente nello store locale user-123
            [Auth] Tentativo di recupero sessione da Redis { userId: 'user-123' }
            [UserHelper] getSessionFromRedis
            
            stdout | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe richiedere una nuova sessione se Redis non ha dati validi
            Session retrieved from Redis: { session: null }
            
            stdout | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe richiedere una nuova sessione se Redis non ha dati validi
            [Auth] Nessuna sessione valida trovata, richiedo nuovi token 
            [UserHelper] getSessionTokens
              [UserHelper] getSessionFromRedis
            
            stdout | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe richiedere una nuova sessione se Redis non ha dati validi
              Session retrieved from Redis: {
                id: 'user-123',
                email: 'test@example.com',
                fullName: 'Test User',
                createdAt: 2025-05-15T16:55:08.671Z,
                lastLogin: 2025-05-15T16:55:08.671Z,
                isAuthenticated: true,
                provider: 'email',
                tokens: {
                  accessToken: 'test-access-token',
                  refreshToken: 'test-refresh-token',
                  expiresAt: 1747331708
                },
                metadata: {
                  provider: 'email',
                  avatarUrl: 'https://example.com/avatar.jpg',
                  githubUsername: 'testuser'
                }
              }
            
            stderr | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe richiedere una nuova sessione se Redis non ha dati validi
              Error fetching session tokens: TypeError: Cannot read properties of undefined (reading 'ok')
                  at UserHelper.getSessionTokens (/home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/src/scripts/getAuth.ts:267:29)
                  at processTicksAndRejections (node:internal/process/task_queues:95:5)
                  at UserHelper.getCompleteSession (/home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/src/scripts/getAuth.ts:364:32)
                  at /home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/src/test/UserHelper.test.ts:111:23
                  at file:///home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/node_modules/@vitest/runner/dist/index.js:573:22
            
            stdout | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe richiedere una nuova sessione se Redis non ha dati validi
            [Auth] Nessuna sessione valida trovata, restituisco utente vuoto 
            
            stdout | src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe gestire gli errori durante il recupero da Redis
            [Auth] Inizio recupero sessione completa 
            [Auth] Utente nello store locale user-123
            [UserHelper] isTokenExpired: false
            [Auth] Trovata sessione valida nello store locale 
            
            stdout | src/test/UserHelper.test.ts > UserHelper > saveSessionToRedis > dovrebbe salvare correttamente la sessione su Redis
            [UserHelper] saveSessionToRedis
            
            stderr | src/test/UserHelper.test.ts > UserHelper > saveSessionToRedis > dovrebbe salvare correttamente la sessione su Redis
            Error saving session to Redis: Error: Errore di rete
                at /home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/src/test/UserHelper.test.ts:119:46
                at file:///home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/node_modules/@vitest/runner/dist/index.js:182:14
                at file:///home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/node_modules/@vitest/runner/dist/index.js:573:28
                at file:///home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/node_modules/@vitest/runner/dist/index.js:64:24
                at new Promise (<anonymous>)
                at runWithTimeout (file:///home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/node_modules/@vitest/runner/dist/index.js:41:12)
                at runTest (file:///home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/node_modules/@vitest/runner/dist/index.js:1202:17)
                at processTicksAndRejections (node:internal/process/task_queues:95:5)
                at runSuite (file:///home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/node_modules/@vitest/runner/dist/index.js:1356:15)
                at runSuite (file:///home/default/develop-env/prod/openfav/openfav-frontend/openfav-refactor/openfav-refactor/node_modules/@vitest/runner/dist/index.js:1356:15)
            
             ❯ src/test/UserHelper.test.ts (5 tests | 4 failed) 52ms
               ✓ UserHelper > getCompleteSession > dovrebbe restituire la sessione dallo store se valida
               × UserHelper > getCompleteSession > dovrebbe recuperare la sessione da Redis se quella locale è scaduta 20ms
                 → expected "spy" to be called with arguments: [ StringContaining{…}, Any<Object> ]
            
            Received: 
            
              1st spy call:
            
              [
            -   StringContaining "/session/user-123",
            -   Any<Object>,
            +   "undefined/session/user_session_user-123",
              ]
            
            
            Number of calls: 1
            
               × UserHelper > getCompleteSession > dovrebbe richiedere una nuova sessione se Redis non ha dati validi 16ms
                 → expected "spy" to be called with arguments: [ { id: 'user-123', …(8) } ]
            
            Received: 
            
              1st spy call:
            
              [
                {
            -     "createdAt": 2025-05-15T16:55:08.671Z,
            -     "email": "test@example.com",
            -     "fullName": "Test User",
            -     "id": "user-123",
            -     "isAuthenticated": true,
            -     "lastLogin": 2025-05-15T16:55:08.671Z,
            +     "createdAt": 2025-05-15T16:55:08.728Z,
            +     "email": "",
            +     "fullName": "Utente",
            +     "id": "",
            +     "isAuthenticated": false,
            +     "lastLogin": 2025-05-15T16:55:08.728Z,
                  "metadata": {
            -       "avatarUrl": "https://example.com/avatar.jpg",
            -       "githubUsername": "testuser",
            +       "avatarUrl": undefined,
                    "provider": "email",
                  },
                  "provider": "email",
                  "tokens": {
            -       "accessToken": "test-access-token",
            -       "expiresAt": 1747331708,
            -       "refreshToken": "test-refresh-token",
            +       "accessToken": null,
            +       "expiresAt": 0,
            +       "refreshToken": null,
                  },
                },
              ]
            
            
            Number of calls: 1
            
               × UserHelper > getCompleteSession > dovrebbe gestire gli errori durante il recupero da Redis 3ms
                 → expected true to be false // Object.is equality
               × UserHelper > saveSessionToRedis > dovrebbe salvare correttamente la sessione su Redis 4ms
                 → expected false to be true // Object.is equality
             ❯ src/test/NavigationContext.test.tsx (0 test)
            
            ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
            
             FAIL  src/test/NavigationContext.test.tsx [ src/test/NavigationContext.test.tsx ]
            ReferenceError: jest is not defined
             ❯ src/test/NavigationContext.test.tsx:8:1
                  6| 
                  7| 
                  8| jest.mock('@/store', () => ({
                   | ^
                  9|     currentPath: { set: jest.fn(), get: jest.fn(() => '/') },
                 10|     previousPath: { set: jest.fn(), get: jest.fn() },
            
            ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯
            
            
            ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
            
             FAIL  src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe recuperare la sessione da Redis se quella locale è scaduta
            AssertionError: expected "spy" to be called with arguments: [ StringContaining{…}, Any<Object> ]
            
            Received: 
            
              1st spy call:
            
              [
            -   StringContaining "/session/user-123",
            -   Any<Object>,
            +   "undefined/session/user_session_user-123",
              ]
            
            
            Number of calls: 1
            
             ❯ src/test/UserHelper.test.ts:85:21
                 83|       expect(session).toBeDefined()
                 84|       expect(session?.tokens.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000))
                 85|       expect(fetch).toHaveBeenCalledWith(
                   |                     ^
                 86|         expect.stringContaining('/session/user-123'),
                 87|         expect.any(Object)
            
            ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯
            
             FAIL  src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe richiedere una nuova sessione se Redis non ha dati validi
            AssertionError: expected "spy" to be called with arguments: [ { id: 'user-123', …(8) } ]
            
            Received: 
            
              1st spy call:
            
              [
                {
            -     "createdAt": 2025-05-15T16:55:08.671Z,
            -     "email": "test@example.com",
            -     "fullName": "Test User",
            -     "id": "user-123",
            -     "isAuthenticated": true,
            -     "lastLogin": 2025-05-15T16:55:08.671Z,
            +     "createdAt": 2025-05-15T16:55:08.728Z,
            +     "email": "",
            +     "fullName": "Utente",
            +     "id": "",
            +     "isAuthenticated": false,
            +     "lastLogin": 2025-05-15T16:55:08.728Z,
                  "metadata": {
            -       "avatarUrl": "https://example.com/avatar.jpg",
            -       "githubUsername": "testuser",
            +       "avatarUrl": undefined,
                    "provider": "email",
                  },
                  "provider": "email",
                  "tokens": {
            -       "accessToken": "test-access-token",
            -       "expiresAt": 1747331708,
            -       "refreshToken": "test-refresh-token",
            +       "accessToken": null,
            +       "expiresAt": 0,
            +       "refreshToken": null,
                  },
                },
              ]
            
            
            Number of calls: 1
            
             ❯ src/test/UserHelper.test.ts:114:29
                112|       
                113|       expect(session).toBeDefined()
                114|       expect(userStore.set).toHaveBeenCalledWith(mockUserSession)
                   |                             ^
                115|     })
                116| 
            
            ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯
            
             FAIL  src/test/UserHelper.test.ts > UserHelper > getCompleteSession > dovrebbe gestire gli errori durante il recupero da Redis
            AssertionError: expected true to be false // Object.is equality
            
            - Expected
            + Received
            
            - false
            + true
            
             ❯ src/test/UserHelper.test.ts:123:39
                121|       // Verifichiamo che l'errore venga gestito e venga restituito l'utente vuoto
                122|       const session = await userHelper.getCompleteSession()
                123|       expect(session.isAuthenticated).toBe(false)
                   |                                       ^
                124|     })
                125|   })
            
            ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯
            
             FAIL  src/test/UserHelper.test.ts > UserHelper > saveSessionToRedis > dovrebbe salvare correttamente la sessione su Redis
            AssertionError: expected false to be true // Object.is equality
            
            - Expected
            + Received
            
            - true
            + false
            
             ❯ src/test/UserHelper.test.ts:136:22
                134|       const result = await userHelper.saveSessionToRedis('user-123', mockUserSession)
                135|       
                136|       expect(result).toBe(true)
                   |                      ^
                137|       expect(fetch).toHaveBeenCalledWith(
                138|         expect.stringContaining('/set-session'),
            
            ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯
            
            
             Test Files  2 failed (2)
                  Tests  4 failed | 1 passed (5)
               Start at  16:55:06
               Duration  3.72s (transform 733ms, setup 307ms, collect 516ms, tests 52ms, environment 1.09s, prepare 213ms)
            
        mockCurrentPath.set.mockImplementation(() => {
            throw new Error('Navigation error')
        })

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Navigate').click()
        })

        expect(toast.error).toHaveBeenCalledWith('Errore durante la navigazione')
        
        // Restore console.error
        console.error = originalError
    })

    it('should warn if there is no previous path on goBack', async () => {
        vi.mocked(previousPath.get).mockReturnValue('')

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Go Back').click()
        })

        expect(mockPreviousPath.get).toHaveBeenCalled()
        expect(toast.warning).toHaveBeenCalledWith('Nessuna pagina precedente')
        expect(mockCurrentPath.set).toHaveBeenCalledWith('/')
    })

    it('should check auth status', async () => {
        // Mock a successful auth check
        vi.mocked(authHelperMock.getCompleteSession).mockResolvedValueOnce({
            isAuthenticated: true,
            id: 'user-123',
            email: 'test@example.com'
        })

        const { getByText } = render(
            <NavigationProvider>
                <TestComponent />
            </NavigationProvider>
        )

        await act(async () => {
            getByText('Check Auth').click()
        })

        expect(authHelperMock.getCompleteSession).toHaveBeenCalled()
    })
  }) // Close NavigationProvider describe block
}) // Close NavigationContext describe block