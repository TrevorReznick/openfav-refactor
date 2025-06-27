import { userStore } from '@/store'
import type { UserSession } from '~/types/users'
import { sessionManager } from '@/scripts/auth/sessionManager'
import { handleSignOut } from '@/react/hooks/useAuthActions'

const REDIS_API_URL = import.meta.env.PUBLIC_REDIS_API_URL

export class UserHelper {

    private static getAuthFromRedisCount = 0

    public getSessionManager() {
        return sessionManager
    }

    /**
     * Esegue la pulizia completa dell'autenticazione
     * - Elimina la sessione Redis
     * - Rimuove i dati utente dallo storage locale
     * - Aggiorna lo store
     */
    public async clearAuth(): Promise<void> {
        try {
            // 1. Elimina la sessione dal server Redis
            await this.deleteRedisSession()

            // 2. Rimuovi i dati dallo storage locale
            localStorage.removeItem('openfav-userId')


            // 3. Aggiorna lo store
            userStore.set(null)

            console.log('[UserHelper] Authentication data cleared successfully')
        } catch (error) {
            console.error('[UserHelper] Error clearing authentication data:', error)
            throw error // Rilancia l'errore per gestirlo a un livello superiore se necessario
        }
    }

    public async getCompleteSession(): Promise<UserSession> {
        console.log('[UserHelper][Redis] getCompleteSession - Inizio');

        // Verifica se l'utente è già autenticato
        if (this.isAuthenticated()) {
            // Se il token è scaduto, prova a rinnovare la sessione
            if (this.isTokenExpired()) {
                console.log('[UserHelper][Redis] Token scaduto, provo a rinnovare la sessione...');
                await this.getSessionTokens() // oppure chiama una funzione di refresh
            }
            return this.getUserInfo()
        }

        // Verifica se esiste una sessione Redis
        const redisAuth = await this.getAuthFromRedis()
        console.log('[UserHelper][Redis] Tento di recuperare la sessione da Redis...')
        if (redisAuth) {
            console.log('[UserHelper][Redis] Sessione recuperata da Redis:', redisAuth)
            return redisAuth;
        }

        // Se non c'è sessione Redis, richiedi i token al backend
        const userInfo = this.getUserInfo()
        const tokens = await this.getSessionTokens();

        console.log('[UserHelper][Redis] getCompleteSession - Risultato:', { ...userInfo, tokens });
        return {
            ...userInfo,
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: tokens.expiresAt ?? 0
            }
        };
    }

    // Richiedi i token di autenticazione
    public async getSessionTokens(): Promise<{
        accessToken: string | null
        refreshToken: string | null
        expiresAt?: number
    }> {
        if (typeof window === 'undefined') {
            return { accessToken: null, refreshToken: null }
        }

        const userId = this.getUserIdFromStorage()

        // 1. Controlla se l'utente è già autenticato
        if (this.isAuthenticated()) {
            console.log('[UserHelper][Redis] User already authenticated, skipping token request')
            const userInfo = this.getUserInfo()
            return {
                accessToken: userInfo.tokens.accessToken,
                refreshToken: userInfo.tokens.refreshToken,
                expiresAt: userInfo.tokens.expiresAt
            }
        }

        // 2. Controlla se esiste una sessione Redis
        console.log('[UserHelper][Redis] Checking for Redis session...')
        const redisAuth = await this.getAuthFromRedis(userId || undefined)

        if (redisAuth) {
            console.log('[UserHelper][Redis] Session found in Redis:', redisAuth)
            return {
                accessToken: redisAuth.tokens.accessToken,
                refreshToken: redisAuth.tokens.refreshToken,
                expiresAt: redisAuth.tokens.expiresAt
            }
        }

        try {
            console.log('[UserHelper][Redis] Requesting new session tokens...')

            // 3. Richiedi nuovi token al backend
            const response = await fetch('/api/v1/auth/signin', {
                method: 'GET',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error(`Auth failed with status: ${response.status}`)
            }

            const data = await response.json()
            console.log('[UserHelper][Auth] Full API response:', data)

            const session = data.session
            if (!session) {
                throw new Error('No session data in response')
            }

            // 4. SALVATAGGIO CRITICO - Aggiunto qui
            if (session.user?.id) {
                // A. Salva ID utente nel localStorage
                localStorage.setItem('openfav-userId', session.user.id)
                console.log('[UserHelper][Storage] Saved userId to localStorage:', session.user.id)

                // B. Crea oggetto sessione completo
                const userSession: UserSession = {
                    id: session.user.id,
                    email: session.user.email || null,
                    fullName: session.user.user_metadata?.full_name || null,
                    createdAt: session.user.created_at ? new Date(session.user.created_at) : null,
                    lastLogin: session.user.last_sign_in_at ? new Date(session.user.last_sign_in_at) : null,
                    isAuthenticated: true, // Impostiamo esplicitamente a true qui
                    provider: session.user.app_metadata?.provider || null,
                    tokens: {
                        accessToken: session.access_token || null,
                        refreshToken: session.refresh_token || null,
                        expiresAt: session.expires_at || 0
                    },
                    metadata: {
                        provider: session.user.app_metadata?.provider || null,
                        avatarUrl: session.user.user_metadata?.avatar_url || null,
                        githubUsername: session.user.user_metadata?.user_name || null
                    },
                    // Aggiungiamo i metadati grezzi per compatibilità
                    user_metadata: session.user.user_metadata || null,
                    app_metadata: session.user.app_metadata || null
                }

                // C. Aggiorna lo store
                userStore.set(userSession)
                console.log('[UserHelper][Store] Updated user store:', userSession)
            } else {
                console.warn('[UserHelper][Auth] Session user data missing ID', session.user)
            }

            return {
                accessToken: session.access_token || null,
                refreshToken: session.refresh_token || null,
                expiresAt: session.expires_at
            }
        } catch (error) {
            console.error('[UserHelper][Redis] Error getting session tokens:', error)
            return {
                accessToken: null,
                refreshToken: null
            }
        }
    }

    /**
     * Recupera i dati della sessione da Redis
     * Se non viene fornito un userId, tenta di recuperare la sessione dal cookie
     */
    public async getAuthFromRedis(userId?: string): Promise<UserSession | null> {
        UserHelper.getAuthFromRedisCount++;
        console.log(`[UserHelper][Redis][${UserHelper.getAuthFromRedisCount}] Fetching Redis session data...`);
        const targetUserId = userId || this.getUserIdFromStorage();

        try {
            const endpoint = targetUserId
                ? `${REDIS_API_URL}/session/${targetUserId}`
                : `${REDIS_API_URL}/session`; // Endpoint che accetta solo il cookie

            const response = await fetch(endpoint, {
                method: 'GET',
                credentials: 'include', // Invia automaticamente i cookie
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`[UserHelper][Redis][${UserHelper.getAuthFromRedisCount}] No active session found`);
                } else {
                    console.error(`[UserHelper][Redis][${UserHelper.getAuthFromRedisCount}] Error fetching session: ${response.status} ${response.statusText}`);
                }
                return null;
            }

            const sessionData = await response.json()
            console.log(`[UserHelper][Redis][${UserHelper.getAuthFromRedisCount}] Session data from Redis API:`, sessionData);

            // Se l'API restituisce la sessione direttamente
            if (sessionData?.id) {
                console.log(`[UserHelper][Redis][${UserHelper.getAuthFromRedisCount}] Valid session Redis data found`);
                // Aggiorna lo storage locale con l'ID utente
                if (!targetUserId && sessionData.id) {
                    localStorage.setItem('openfav-userId', sessionData.id);
                }
                // Aggiorna lo store con i dati della sessione
                userStore.set(sessionData);
                return sessionData;
            }

            // Se l'API restituisce la sessione in una proprietà 'session'
            if (sessionData?.session) {
                console.log(`[UserHelper][Redis][${UserHelper.getAuthFromRedisCount}] Session data found in .session property`);
                // Update the store with Redis session data
                userStore.set(sessionData.session);
                return sessionData.session;
            }

            console.warn(`[UserHelper][Redis][${UserHelper.getAuthFromRedisCount}] No valid session data found in response`);
            return null;
        } catch (error) {
            console.error(`[UserHelper][Redis][${UserHelper.getAuthFromRedisCount}] Error getting auth from Redis:`, error);
            return null;
        }
    }

    // Ottiene i dati base dell'utente
    public getUserInfo(): UserSession {
        const user = userStore.get()
        console.log('[UserHelper][Store] getUserInfo:', user)

        if (!user || !user.id) {
            console.warn('[UserHelper][Store] getUserInfo: No user found in store or user has no ID, returning empty user')
            return this.getEmptyUser()
        }

        // Se l'utente esiste ma non è autenticato, restituisci l'utente vuoto
        if (user.isAuthenticated === false) {
            console.warn('[UserHelper][Store] getUserInfo: User is not authenticated, returning empty user')
            return this.getEmptyUser()
        }

        return {
            id: user.id,
            email: user.email || null,
            fullName: user.user_metadata?.full_name || null,
            createdAt: user.created_at ? new Date(user.created_at) : null,
            lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
            isAuthenticated: true,
            provider: user.app_metadata?.provider || null,
            tokens: {
                accessToken: user.tokens?.accessToken || null,
                refreshToken: user.tokens?.refreshToken || null,
                expiresAt: user.tokens?.expiresAt || 0
            },
            metadata: {
                provider: user.app_metadata?.provider || null,
                avatarUrl: user.user_metadata?.avatar_url || null
            },
            user_metadata: user.user_metadata || null,
            app_metadata: user.app_metadata || null
        }
    }

    // Utente vuoto per stato iniziale/logout
    private getEmptyUser(): UserSession {
        return {
            id: null,
            email: null,
            fullName: null,
            createdAt: null,
            lastLogin: null,
            isAuthenticated: false,
            provider: null,
            tokens: {
                accessToken: null,
                refreshToken: null,
                expiresAt: 0
            },
            metadata: {
                provider: null,
                avatarUrl: null
            },
            user_metadata: null,
            app_metadata: null
        }
    }

    // Verifica se l'utente è autenticato
    public isAuthenticated(): boolean {
        const user = userStore.get()
        
        // Se non c'è utente, non è autenticato
        if (!user) {
            console.log('[UserHelper][Auth] No user in store')
            return false
        }
        
        // Se l'utente ha esplicitamente isAuthenticated a false, non è autenticato
        if (user.isAuthenticated === false) {
            console.log('[UserHelper][Auth] User explicitly not authenticated')
            return false
        }
        
        // Verifica se il token è valido
        const tokenValid = this.isTokenValid(user.tokens?.accessToken, user.tokens?.expiresAt)
        
        // Se il token non è valido ma abbiamo un utente, potremmo voler aggiornare lo stato
        if (!tokenValid && user.id) {
            console.log('[UserHelper][Auth] Token not valid, updating user state')
            userStore.update(u => ({
                ...u,
                isAuthenticated: false
            }))
        }
        
        console.log('[UserHelper][Auth] isAuthenticated:', tokenValid, {
            hasUser: !!user,
            userId: user.id,
            hasToken: !!user.tokens?.accessToken,
            tokenExpired: this.isTokenExpired()
        })
        
        return tokenValid
    }

    // Verifica se il token fornito è valido
    private isTokenValid(token: string | null, expiresAt: number | null | undefined): boolean {
        if (!token) return false
        
        // Se expiresAt è 0, il token non ha scadenza
        if (expiresAt === 0) return true
        
        // Altrimenti controlla la scadenza
        const now = Date.now()
        return expiresAt ? now < expiresAt * 1000 : false
    }

    // Verifica se il token è scaduto
    public isTokenExpired(): boolean {
        const user = userStore.get()
        if (!user) return true

        // Usa il metodo isTokenValid per verificare il token
        const tokenValid = this.isTokenValid(user.tokens?.accessToken, user.tokens?.expiresAt)
        const isExpired = !tokenValid
        
        console.log('[UserHelper][Auth] isTokenExpired:', isExpired, {
            hasToken: !!user.tokens?.accessToken,
            expiresAt: user.tokens?.expiresAt,
            now: Date.now()
        })
        
        return isExpired
    }

    public async checkRedisSession(userId: string): Promise<boolean> {
        try {
            console.log('[UserHelper][Redis] Checking session for user ID:', userId)
            if (!userId) return false

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
            if (!user.id) {
                console.error('[UserHelper] Cannot create Redis session: Missing user ID')
                return false
            }

            console.log('[UserHelper][Redis] Creating session for user:', user.id)

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
                const errorText = await response.text()
                throw new Error(`Redis session creation failed: ${response.status} - ${errorText}`)
            }

            const data = await response.json()
            console.log('[UserHelper][Redis] Session creation response:', data)
            return data.success === true
        } catch (error) {
            console.error('[UserHelper][Redis] Error creating Redis session:', error)
            return false
        }
    }

    // Crea una nuova sessione Redis
    public async createRedisSessionOld(): Promise<boolean> {
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

    // Elimina la sessione Redis
    public async deleteRedisSession(): Promise<boolean> {
        try {
            const userId = this.getUserIdFromStorage()
            if (!userId) return false

            const response = await fetch(`${REDIS_API_URL}/session/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to delete session from Redis')
            }

            return true
        } catch (error) {
            console.error('Error deleting Redis session:', error)
            return false
        }
    }

    // Recupera l'ID utente da localStorage in modo sicuro per SSR
    public getUserIdFromStorage(): string | null {
        if (typeof window === 'undefined') return null
        try {
            return localStorage.getItem('openfav-userId')
        } catch (error) {
            console.error('Error accessing localStorage:', error)
            return null
        }
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


    public async getSessionTokensOld(): Promise<{
        accessToken: string | null
        refreshToken: string | null
        expiresAt?: number
    }> {
        try {
            console.log('[UserHelper][Redis] Richiedo session tokens...')

            // Verifica se esiste una sessione Redis
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
                userStore.set(session.user)
                localStorage.setItem('openfav-userId', session.user.id)
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

    public async getCompleteSessionOld(): Promise<UserSession> {
        console.log('[UserHelper][Debug] getCompleteSession - Inizio');

        // Verifica se l'utente è già autenticato
        if (this.isAuthenticated()) {
            console.log('[UserHelper][Debug] Utente già autenticato');
            const userInfo = this.getUserInfo();
            return {
                ...userInfo,
                isAuthenticated: true // forza isAuthenticated a true
            }
        }

        // Verifica se esiste una sessione Redis
        const redisAuth = await this.getAuthFromRedis()

        if (redisAuth) {
            console.log('[UserHelper][Debug] Sessione recuperata da Redis:', redisAuth)
            if (!userStore.get()) {
                userStore.set(redisAuth)
            }
            return {
                ...redisAuth,
                isAuthenticated: true // forza isAuthenticated a true
            }
        }

        // Se non c'è sessione Redis, richiedi i token al backend
        const tokens = await this.getSessionTokens()
        const userInfo = this.getUserInfo() // ora lo store è aggiornato

        console.log('[UserHelper][Debug] getCompleteSession - Risultato:', { ...userInfo, tokens })
        return {
            ...userInfo,
            isAuthenticated: true, // forza isAuthenticated a true
            tokens: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresAt: tokens.expiresAt ?? 0
            }
        }
    }
}

// Esporta un'istanza singleton
export const userHelper = new UserHelper()
