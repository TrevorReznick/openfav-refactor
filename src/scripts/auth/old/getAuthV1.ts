import { userStore } from '@/store'
import type { UserSession } from '~/types/users'
import { handleSignOut } from '@/react/hooks/useAuthActions'

const REDIS_API_URL = import.meta.env.PUBLIC_REDIS_API_URL

export class UserHelper {
    private readonly STORAGE_KEY = 'openfav-userId'
    private readonly SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days

    // === REDIS SESSION MANAGEMENT ===

    public async checkRedisSession(userId: string): Promise<boolean> {
        if (!userId) return false

        try {
            console.log('[UserHelper][Redis] Checking session for user ID:', userId)
            const response = await fetch(`${REDIS_API_URL}/session/${userId}`, {
                method: 'GET',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('[UserHelper][Redis] Failed to check Redis session')
            }

            const data = await response.json()
            console.log('[UserHelper][Redis] Session check result:', data)
            return data?.exists === true
        } catch (error) {
            console.error('[UserHelper][Redis] Error checking Redis session:', error)
            return false
        }
    }

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
                    expiresIn: this.SESSION_DURATION
                })
            })

            if (!response.ok) {
                throw new Error('[UserHelper][Redis] Failed to create Redis session')
            }

            const data = await response.json()
            console.log('[UserHelper][Redis] Session created successfully:', data)
            return data?.success === true
        } catch (error) {
            console.error('[UserHelper][Redis] Error creating Redis session:', error)
            return false
        }
    }

    public async deleteRedisSession(): Promise<boolean> {
        try {
            const userId = this.getUserInfo().id
            if (!userId) return false

            const response = await fetch(`${REDIS_API_URL}/session/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('[UserHelper][Redis] Failed to delete Redis session')
            }

            const data = await response.json()
            console.log('[UserHelper][Redis] Session deleted successfully:', data)
            return data?.success === true
        } catch (error) {
            console.error('[UserHelper][Redis] Error deleting Redis session:', error)
            return false
        }
    }

    // === HELPER METHODS ===

    // Metodo centrale per ottenere l'utente corrente dallo store
    private getCurrentUser() {
        return userStore.get()
    }

    // Sincronizza store e localStorage
    private syncUserStorage(user: any) {
        if (user?.id) {
            userStore.set(user)
            localStorage.setItem(this.STORAGE_KEY, user.id)
        }
    }

    // Costruisce oggetto UserSession standardizzato
    private buildUserSession(user: any): UserSession {
        return {
            id: user.id || '',
            email: user.email || '',
            fullName: user.user_metadata?.full_name || 'Utente',
            createdAt: new Date(user.created_at || Date.now()),
            lastLogin: new Date(user.last_sign_in_at || Date.now()),
            isAuthenticated: true,
            provider: user.app_metadata?.provider || 'email',
            tokens: {
                accessToken: user.access_token || null,
                refreshToken: user.refresh_token || null,
                expiresAt: user.expires_at || 0
            },
            metadata: {
                provider: user.app_metadata?.provider || 'email',
                avatarUrl: user.user_metadata?.avatar_url
            }
        }
    }

    // === PUBLIC API - NOMI ORIGINALI MANTENUTI ===

    public async getAuthFromRedis(): Promise<UserSession | null> {
        const userId = this.getUserIdFromStorage()
        if (!userId) return null

        try {
            const isRedisSessionValid = await this.checkRedisSession(userId)
            if (!isRedisSessionValid) return null

            const response = await fetch(`${REDIS_API_URL}/session/${userId}`)
            const sessionData = await response.json()

            if (!sessionData || !sessionData.session) return null

            console.log('[UserHelper][Redis] Session data from Redis:', sessionData.session)

            // Prima aggiorna lo store con i dati Redis
            userStore.set(sessionData.session)

            // POI verifica se il token è valido (ora che lo store è aggiornato)
            const isTokenValid = !this.isTokenExpired()
            console.log('[UserHelper][Redis] Token valid after Redis update:', isTokenValid)

            if (isTokenValid) {
                return this.buildUserSession(sessionData.session)
            }

            console.log('[UserHelper][Redis] Token expired, clearing store')
            userStore.set(null) // Pulisce se il token è scaduto
            return null
        } catch (error) {
            console.error('[UserHelper][Redis] Error getting auth from Redis:', error)
            return null
        }
    }

    public getUserInfo(): UserSession {
        const user = this.getCurrentUser()
        console.log('[UserHelper][Store] getUserInfo:', user)

        if (!user) {
            console.warn('[UserHelper][Store] getUserInfo: No user found in store, returning empty user')
            return this.getEmptyUser()
        }

        return this.buildUserSession(user)
    }

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

    public isAuthenticated(): boolean {
        const user = this.getCurrentUser()
        const auth = !!user && !this.isTokenExpired()
        console.log('[UserHelper][Auth] isAuthenticated:', auth)
        return auth
    }

    public isTokenExpired(): boolean {
        const user = this.getCurrentUser()
        if (!user) return true

        const expiresAt = user.exp
        const isExpired = expiresAt ? Date.now() >= expiresAt * 1000 : true
        console.log('[UserHelper][Auth] isTokenExpired:', isExpired)
        return isExpired
    }

    public getUserIdFromStorage(): string | null {
        // Priorità: store corrente > localStorage
        const user = this.getCurrentUser()
        if (user?.id) return user.id

        return localStorage.getItem(this.STORAGE_KEY)
    }

    public async getSessionTokens(): Promise<{
        accessToken: string | null
        refreshToken: string | null
        expiresAt?: number
    }> {
        try {
            console.log('[UserHelper][Redis] Richiedo session tokens...')

            // Prima verifica se esiste una sessione Redis per evitare chiamate inutili
            const redisAuth = await this.getAuthFromRedis()
            if (redisAuth) {
                console.log('[UserHelper][Redis] Sessione recuperata da Redis:', redisAuth)
                return {
                    accessToken: redisAuth.tokens.accessToken,
                    refreshToken: redisAuth.tokens.refreshToken,
                    expiresAt: redisAuth.tokens.expiresAt
                }
            }

            // Se non c'è sessione Redis, effettua la richiesta al server
            const response = await fetch('/api/v1/auth/signin', {
                method: 'GET',
                credentials: 'include'
            })
            const { session } = await response.json()

            console.log('[UserHelper][Auth] Risposta tokens:', session)

            // Aggiorna lo store se c'è l'utente
            if (session?.user) {
                this.syncUserStorage(session.user)
            }

            return {
                accessToken: session?.access_token || null,
                refreshToken: session?.refresh_token || null,
                expiresAt: session?.expires_at
            }
        } catch (error) {
            console.error('[UserHelper][Redis] Error getting session tokens:', error)
            return {
                accessToken: null,
                refreshToken: null
            }
        }
    }

    public async getCompleteSession(): Promise<UserSession> {
        console.log('[UserHelper][Debug] getCompleteSession - Inizio');

        // Verifica se l'utente è già autenticato
        // Unifica la logica di autenticazione e recupero sessione
        let userSession: UserSession | null = null

        if (this.isAuthenticated()) {
            console.log('[UserHelper][Debug] Utente già autenticato');
            userSession = this.getUserInfo()
            console.log('[UserHelper][Debug] isAuthenticated:', userSession.isAuthenticated)
        } else {
            const redisAuth = await this.getAuthFromRedis()
            if (redisAuth) {
                console.log('[UserHelper][Debug] Sessione recuperata da Redis:', redisAuth)
                userSession = redisAuth
                console.log('[UserHelper][Debug][Redis] isAuthenticated:', userSession.isAuthenticated)
            }
        }

        if (userSession && userSession.isAuthenticated) {
            return userSession
        }

        // Se non autenticato, richiedi i token al backend
        const tokens = await this.getSessionTokens()

        // Dopo aver aggiornato lo store, ri-verifica l'autenticazione
        if (this.isAuthenticated()) {
            console.log('[UserHelper][Debug] Utente autenticato dopo recupero tokens');
            const userInfo = this.getUserInfo()
            return {
                ...userInfo,
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresAt: tokens.expiresAt ?? 0
                }
            }
        }

        // Se ancora non autenticato, restituisci sessione vuota con i token recuperati
        console.log('[UserHelper][Debug] Sessione non valida, restituisco utente vuoto');
        const emptyUser = this.getEmptyUser()
        return {
            ...emptyUser,
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: tokens.expiresAt ?? 0
            }
        };
    }

    // === REDIS TESTING METHODS ===

    public async testRedisSet(key: string, value: string): Promise<boolean> {
        try {
            const response = await fetch(`${REDIS_API_URL}/test/set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            })
            return response.ok
        } catch (error) {
            console.error('[UserHelper][Redis] Error testing Redis set:', error)
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
            console.error('[UserHelper][Redis] Error testing Redis get:', error)
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
            console.error('[UserHelper][Redis] Error testing Redis delete:', error)
            return false
        }
    }
}

// Esporta un'istanza singleton
export const userHelper = new UserHelper()