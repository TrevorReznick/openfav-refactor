import { userStore } from '@/store'
import type { UserSession } from '~/types/users'
import { handleSignOut } from '@/react/hooks/useAuthActions'

const REDIS_API_URL = import.meta.env.PUBLIC_REDIS_API_URL

export class UserHelper {
    // Verifica se esiste una sessione Redis per l'utente

    // Verifica se l'utente è autenticato
    public isAuthenticated(): boolean {
        const auth = !!userStore.get()
        console.log('[UserHelper] isAuthenticated:', auth)
        return auth
    }

    public async getSessionTokens(): Promise<{
        accessToken: string | null
        refreshToken: string | null
        expiresAt?: number
    }> {
        try {
            console.log('[UserHelper] Richiedo session tokens...');

            // Verifica se esiste una sessione Redis
            const redisAuth = await this.getAuthFromRedis()

            if (redisAuth) {
                console.log('[Redis] Sessione recuperata da Redis:', redisAuth)
                return {
                    accessToken: redisAuth.tokens.accessToken,
                    refreshToken: redisAuth.tokens.refreshToken,
                    expiresAt: redisAuth.tokens.expiresAt
                }
            } else {
                this.checkRedisSession()
                console.log('[Redis] Nessuna sessione Redis trovata, procedo con la richiesta al server');
            }

            // Se non c'è sessione Redis, effettua la richiesta al server
            const response = await fetch('/api/v1/auth/signin', {
                method: 'GET',
                credentials: 'include'
            })
            const { session } = await response.json()

            console.log('[UserHelper] Risposta tokens:', session)

            // Aggiorna lo store se c'è l'utente
            if (session?.user) {
                userStore.set(session.user)
            }

            return {
                accessToken: session?.access_token || null,
                refreshToken: session?.refresh_token || null,
                expiresAt: session?.expires_at
            };
        } catch (error) {
            console.error('[UserHelper] Error getting session tokens:', error);
            return {
                accessToken: null,
                refreshToken: null
            }
        }
    }

    // Ottiene informazioni complete (utente + sessione)
    public async getCompleteSession(): Promise<UserSession> {
        console.log('[UserHelper] getCompleteSession - Inizio')
        const userInfo = this.getUserInfo()
        const tokens = await this.getSessionTokens()

        console.log('[UserHelper] getCompleteSession - Risultato:', { ...userInfo, tokens })
        return {
            ...userInfo,
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: tokens.expiresAt ?? 0 // or another default number if preferred
            }
        }
    }

    public async checkRedisSession(): Promise<boolean> {
        try {
            const userId = this.getUserInfo().id
            console.log('[Redis] Checking session for user ID:', userId)
            if (!userId) return false

            const response = await fetch(`${REDIS_API_URL}/session/${userId}`, {
                method: 'GET',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('[Redis] Failed to check Redis session')
            }

            const data = await response.json()
            console.log('[Redis] Session check result:', data)
            return data?.exists === true
        } catch (error) {
            console.error('[Redis] Error checking Redis session:', error)
            return false
        }
    }

    // Crea una nuova sessione Redis
    public async createRedisSession(): Promise<boolean> {
        try {
            const user = this.getUserInfo()
            if (!user.id) return false

            const response = await fetch(`${REDIS_API_URL}/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId: user.id,
                    email: user.email,
                    expiresIn: 60 * 60 * 24 * 7 // 7 days
                })
            })

            if (!response.ok) {
                throw new Error('Failed to create Redis session')
            }

            const data = await response.json()
            console.log('[Redis] Session created successfully:', data)
            return data?.success === true
        } catch (error) {
            console.error('[UserHelper] Error creating Redis session:', error)
            return false
        }
    }

    // Elimina la sessione Redis
    public async deleteRedisSession(): Promise<boolean> {
        try {
            const userId = this.getUserInfo().id
            if (!userId) return false

            const response = await fetch(`${REDIS_API_URL}/session/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to delete Redis session')
            }

            const data = await response.json()
            console.log('[Redis] Session deleted successfully:', data)
            return data?.success === true
        } catch (error) {
            console.error('[UserHelper] Error deleting Redis session:', error)
            return false
        }
    }

    // Recupera l'autenticazione da Redis
    public async getAuthFromRedis(): Promise<UserSession | null> {
        try {
            const userId = this.getUserInfo().id
            if (!userId) {
                console.warn('[Redis] getAuthFromRedis: No user ID found')
                return null
            }

            const isRedisSessionValid = await this.checkRedisSession()

            if (!isRedisSessionValid) {
                return null
            }

            const response = await fetch(`${REDIS_API_URL}/session/${userId}`)
            const sessionData = await response.json()

            if (!sessionData || !sessionData.session) return null

            const isTokenValid = this.isTokenExpired()

            if (!isTokenValid) {
                userStore.set(sessionData.session)
                return sessionData.session
            }

            return null
        } catch (error) {
            console.error('[Redis] Error getting auth from Redis:', error)
            return null
        }
    }

    // Ottiene i dati base dell'utente
    public getUserInfo(): UserSession {
        const user = userStore.get()

        console.log('[UserHelper] getUserInfo:', user)

        if (!user) {
            return this.getEmptyUser()
        }

        return {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || 'Utente',
            createdAt: new Date(user.created_at),
            lastLogin: new Date(user.last_sign_in_at),
            isAuthenticated: true,
            provider: user.app_metadata?.provider || 'email',
            tokens: {
                accessToken: null,
                refreshToken: null,
                expiresAt: 0
            },
            metadata: {
                provider: user.app_metadata?.provider || 'email',
                avatarUrl: user.user_metadata?.avatar_url
            }
        }
    }

    // Utente vuoto per stato iniziale/logout
    private getEmptyUser(): UserSession {
        return {
            id: '',
            email: '',
            fullName: '',
            createdAt: new Date(),
            lastLogin: new Date(),
            isAuthenticated: false,
            provider: 'email',
            tokens: {
                accessToken: null,
                refreshToken: null,
                expiresAt: 0
            },
            metadata: {
                provider: 'email',
                avatarUrl: undefined
            }
        }
    }

    // Verifica se il token è scaduto
    public isTokenExpired(): boolean {
        const user = userStore.get()
        if (!user) return true

        const expiresAt = user.exp
        const isExpired = expiresAt ? Date.now() >= expiresAt * 1000 : true
        console.log('[UserHelper] isTokenExpired:', isExpired)
        return isExpired
    }

    // Metodi di test per Redis
    public async testRedisSet(key: string, value: string): Promise<boolean> {
        try {
            const response = await fetch(`${REDIS_API_URL}/test/set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            })
            return response.ok
        } catch (error) {
            console.error('[Redis] Error testing Redis set:', error)
            return false
        }
    }

    public async testRedisGet(key: string): Promise<string | null> {
        try {
            const response = await fetch(`${REDIS_API_URL}/test/get?key=${encodeURIComponent(key)}`)
            if (!response.ok) return null
            const data = await response.json()
            return data?.value || null
        } catch (error) {
            console.error('[Redis] Error testing Redis get:', error)
            return null
        }
    }

    public async testRedisDelete(key: string): Promise<boolean> {
        try {
            const response = await fetch(`${REDIS_API_URL}/test/delete?key=${encodeURIComponent(key)}`, {
                method: 'DELETE'
            })
            return response.ok
        } catch (error) {
            console.error('[Redis] Error testing Redis delete:', error)
            return false
        }
    }
}

// Esporta un'istanza singleton
export const userHelper = new UserHelper()