import { useEffect, useState, useRef } from 'react'
import { useStore } from '@nanostores/react'
import { currentPath, userStore } from '@/store'
import { UserHelper } from '~/scripts/auth/getAuth'
import { userHelper } from '~/scripts/auth/getAuth';
import { debugSignOut } from '~/scripts/auth/logout';

const DebugAuth = () => {
  console.log('🔍 [DebugAuth] Rendering component...');
  const current = useStore(currentPath)
  const user = useStore(userStore)
  const userHelper = useRef(new UserHelper()).current
  const [redisStatus, setRedisStatus] = useState<{
    success?: boolean
    message?: string
    data?: any
  }>({})
  const isAuthenticated = !!user?.id

  // Helper function to safely log user data with truncated tokens
  const safeLogUser = (userData: any) => {
    if (!userData) return null
    return {
      ...userData,
      tokens: userData.tokens ? {
        accessToken: userData.tokens.accessToken ?
          `${userData.tokens.accessToken.substring(0, 10)}...` : null,
        refreshToken: userData.tokens.refreshToken ?
          `${userData.tokens.refreshToken.substring(0, 10)}...` : null,
        expiresAt: userData.tokens.expiresAt
      } : null
    }
  }

  // Verifica manuale della sessione (solo quando cambia user.id)
  useEffect(() => {
    console.log('🔍 [DebugAuth] User changed:', {
      userId: user?.id,
      isAuthenticated
    })
    if (!user?.id) return

    const checkAuth = async () => {
      try {
        const isAuth = userHelper.isAuthenticated()
        const isExpired = userHelper.isTokenExpired()

        console.log('🔍 [DebugAuth] Manual auth check:')
        console.log('- UserHelper.isAuthenticated():', isAuth)
        console.log('- Token expired:', isExpired)
        console.log('- User info from store:', user)
        console.log('- Cookies available:', document.cookie ? 'yes' : 'no')
      } catch (e) {
        console.error('Error checking auth:', e)
      }
    }

    checkAuth()
  }, [user?.id])

  // Log authentication state SOLO al mount o cambio user.id
  useEffect(() => {
    console.log('🔐 Auth Debug:')
    console.log('- isAuthenticated:', isAuthenticated)
    console.log('- user object:', user)
    console.log('- safe user data:', safeLogUser(user))
    console.log('- current path:', current)

    const checkSession = async () => {
      try {
        const tokens = await userHelper.getSessionTokens()
        console.log('🔄 Tokens from userHelper:', tokens)
        const isAuth = userHelper.isAuthenticated()
        console.log('🔒 isAuthenticated:', isAuth)
        if (user?.id && (!tokens || !tokens.accessToken)) {
          console.warn('⚠️ User exists but has no valid tokens!')
          console.log('- User ID:', user.id)
          console.log('- Stored tokens:', user.tokens)
        }
      } catch (error) {
        console.error('❌ Error checking session:', error)
      }
    }

    checkSession()
  }, [user?.id])

  // Funzioni per testare Redis
  const testRedisSet = async () => {
    if (!user?.id) {
      setRedisStatus({ success: false, message: "No user ID available" })
      return
    }

    try {
      const redisApiUrl = import.meta.env.PUBLIC_REDIS_API_URL
      const sessionData = {
        session: {
          id: user.id,
          email: user.email,
          fullName: user.fullName || 'User',
          createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
          lastLogin: user.lastLogin?.toISOString() || new Date().toISOString(),
          isAuthenticated: true,
          provider: user.provider || 'email',
          tokens: {
            accessToken: user.tokens?.accessToken || 'test-token',
            refreshToken: user.tokens?.refreshToken || 'test-refresh',
            expiresAt: user.tokens?.expiresAt || Date.now() + 3600000
          },
          metadata: {
            provider: user.metadata?.provider || 'email',
            avatarUrl: user.metadata?.avatarUrl,
            githubUsername: user.metadata?.githubUsername
          }
        },
        expirySeconds: 3600
      }

      const response = await fetch(`${redisApiUrl}/set-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })

      const data = await response.json()
      console.log('Redis SET response:', data)
      setRedisStatus({ success: response.ok, message: "Session saved to Redis", data })
    } catch (error) {
      console.error('Redis SET error:', error)
      setRedisStatus({ success: false, message: String(error) })
    }
  }

  const testRedisGet = async () => {
    if (!user?.id) {
      setRedisStatus({ success: false, message: "No user ID available" })
      return
    }

    try {
      const redisApiUrl = import.meta.env.PUBLIC_REDIS_API_URL
      const response = await fetch(`${redisApiUrl}/session/${user.id}`)
      const data = await response.json()
      console.log('Redis GET response:', data)
      setRedisStatus({
        success: response.ok,
        message: response.ok ? "Session retrieved from Redis" : "No session found",
        data
      })
    } catch (error) {
      console.error('Redis GET error:', error)
      setRedisStatus({ success: false, message: String(error) })
    }
  }

  const handleGetSession = async () => {
    try {
      const session = await userHelper.getCompleteSession();
      if (!session) {
        alert('Session is null or does not exist');
        console.log('🔍 [DebugAuth] No active session found');
        return;
      }
      console.log('🔍 [DebugAuth] Session:', session);
      alert('Session exists and is valid');
    } catch (error) {
      console.error('Error getting session:', error);
      alert('Error checking session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const testRedisDelete = async () => {
    if (!user?.id) {
      setRedisStatus({ success: false, message: "No user ID available" })
      return
    }

    try {
      const redisApiUrl = import.meta.env.PUBLIC_REDIS_API_URL
      const response = await fetch(`${redisApiUrl}/delete/${user.id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      console.log('Redis DELETE response:', data)
      setRedisStatus({ success: response.ok, message: "Session deleted from Redis", data })
    } catch (error) {
      console.error('Redis DELETE error:', error)
      setRedisStatus({ success: false, message: String(error) })
    }
  }

  return (
    <div>
      {/* Debug panel */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded shadow-lg z-50 text-sm">
        <h3 className="font-bold text-lg mb-2">Auth Debug</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>Status:</div>
          <div className={isAuthenticated ? "text-green-400" : "text-red-400"}>
            {isAuthenticated ? "Authenticated ✅" : "Not Authenticated ❌"}
          </div>
          <div>User:</div>
          <div>{user ? (user.email || JSON.stringify(user).substring(0, 20) + "...") : "null"}</div>
          <div>Path:</div>
          <div>{current || window.location.pathname}</div>
          <div>Token:</div>
          <div>{user?.tokens?.accessToken ? "Present" : "None"}</div>
          <div>Expires:</div>
          <div>
            {user?.tokens?.expiresAt
              ? new Date(user.tokens.expiresAt * 1000).toLocaleTimeString()
              : "N/A"}
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            className="px-2 py-1 bg-blue-600 rounded text-xs"
            onClick={handleGetSession}
          >
            Check Session
          </button>
          <button
            className="px-2 py-1 bg-green-600 rounded text-xs"
            onClick={() => {
              window.location.href = '/api/v1/auth/signin'
            }}
          >
            Sign In
          </button>
          <button
            className="px-2 py-1 bg-red-600 rounded text-xs"
            onClick={async () => {
              await debugSignOut()
              window.location.reload()
            }}
          >
            Sign Out
          </button>
        </div>
        {/* Redis Debug Section */}
        <div className="mt-4 border-t border-gray-600 pt-2">
          <h3 className="font-bold mb-2">Redis Debug</h3>
          <div className="flex space-x-2 mb-2">
            <button
              className="px-2 py-1 bg-blue-500 rounded text-xs"
              onClick={testRedisGet}
            >
            Get Redis
            </button>
            <button
              className="px-2 py-1 bg-green-500 rounded text-xs"
              onClick={testRedisSet}
            >
            Set Redis
            </button>
            <button
              className="px-2 py-1 bg-red-500 rounded text-xs"
              onClick={testRedisDelete}
            >
            Delete Redis
            </button>
          </div>
          {redisStatus.message && (
            <div className={`text-xs p-1 rounded ${redisStatus.success ? 'bg-green-800' : 'bg-red-800'}`}>
              {redisStatus.message}
            </div>
          )}
          {redisStatus.data && (
            <div className="mt-1 max-h-24 overflow-auto text-xs break-words">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  (() => {
                    if (redisStatus.data && typeof redisStatus.data === 'object') {
                      const { tokens, ...rest } = redisStatus.data
                      return rest
                    }
                    return redisStatus.data
                  })(),
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Barra di stato dell'autenticazione */}
      {/* Barra di stato dell'autenticazione */}
      <div className={`p-2 text-white text-sm ${isAuthenticated ? 'bg-green-600' : 'bg-red-600'}`}>
        Auth Status: {isAuthenticated ? 'Authenticated ✅' : 'Not Authenticated ❌'}
        {isAuthenticated && user && (
          <span className="ml-2">User: {user.email || user.id}</span>
        )}
      </div>
    </div>
  )
}

export default DebugAuth
