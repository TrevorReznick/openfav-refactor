import { userHelper } from '@/scripts/auth/getAuth'

class SessionManager {
    private static instance: SessionManager;
    private sessionCache: Map<string, { session: any; timestamp: number }> = new Map();
    private CACHE_TTL = 5 * 60 * 1000; // 5 minuti

    private constructor() { }

    static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager()
        }
        console.log('[SessionManager] Instance created')
        return SessionManager.instance;
    }

    async getCompleteSession() {
        const userId = userHelper.getUserIdFromStorage();
        if (userId) {
            const cached = this.sessionCache.get(userId);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                return cached.session;
            }
        }

        try {
            // 2. Prova a recuperare la sessione dal server
            const session = await userHelper.getAuthFromRedis();
            if (session) {
                // Aggiorna la cache con la nuova sessione
                this.sessionCache.set(session.id, { 
                    session, 
                    timestamp: Date.now() 
                });
                console.log('[SessionManager] Session cached in memory');
                return session;
            } else {
                console.warn('[SessionManager] No session data found in Redis');
            }
        } catch (error) {
            console.error('[SessionManager] Error getting session:', error);
        }
        return null;
    }

    async invalidateSession() {
        const userId = userHelper.getUserIdFromStorage();
        if (userId) {
            this.sessionCache.delete(userId);
            await userHelper.clearAuth(); // Delega la pulizia a UserHelper
        }
    }

    async createSession() {
        // Crea una nuova sessione Redis tramite userHelper
        return await userHelper.createRedisSession();
    }

    async refreshSession() {
        const userId = userHelper.getUserIdFromStorage();
        if (userId) {
            this.sessionCache.delete(userId);
            return this.getCompleteSession();
        }
        return null;
    }

    /**
     * Verifica se l'utente è autenticato
     * @returns Promise<boolean> True se l'utente è autenticato, altrimenti false
     */
    public async isAuthenticated(): Promise<boolean> {
        try {
            const isAuthenticated = await userHelper.isAuthenticated()
            return isAuthenticated
        } catch (error) {
            console.error('[SessionManager] Error checking authentication status:', error);
            return false;
        }
    }
}

export const sessionManager = SessionManager.getInstance()