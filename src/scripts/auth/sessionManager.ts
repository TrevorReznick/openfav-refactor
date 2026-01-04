import { userHelper } from '@/scripts/auth/getAuth'
import type { UserSession } from '~/types/users'

class SessionManager {
    private static instance: SessionManager;
    private sessionCache: { session: UserSession | null; timestamp: number } = {
        session: null,
        timestamp: 0
    };
    private CACHE_TTL = 5 * 60 * 1000; // 5 minuti

    private constructor() { }

    static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager()
        }
        return SessionManager.instance;
    }

    private loadingPromise: Promise<UserSession | null> | null = null;

    async getCompleteSession(): Promise<UserSession | null> {
        if (this.isCacheValid()) {
            return this.sessionCache.session;
        }
        if (this.loadingPromise) {
            return this.loadingPromise;
        }
        this.loadingPromise = (async () => {
            try {
                const session = await userHelper.getCompleteSession();
                if (session) {
                    this.updateCache(session);
                    return session;
                }
                return null;
            } catch (error) {
                console.error('[SessionManager] Error getting session:', error);
                return this.sessionCache.session;
            } finally {
                this.loadingPromise = null;
            }
        })();
        return this.loadingPromise;
    }

    async invalidateSession(): Promise<void> {
        this.clearCache();
        await userHelper.clearAuth();
    }

    async createSession(): Promise<boolean> {
        this.clearCache();
        return userHelper.createRedisSession();
    }

    async refreshSession(): Promise<UserSession | null> {
        this.clearCache();
        return this.getCompleteSession();
    }

    public isAuthenticated(): boolean {
        return userHelper.isAuthenticated();
    }

    // --- Metodi di supporto ---

    private isCacheValid(): boolean {
        return !!this.sessionCache.session &&
            (Date.now() - this.sessionCache.timestamp < this.CACHE_TTL) &&
            !this.isSessionExpired(this.sessionCache.session);
    }

    private isSessionExpired(session: UserSession): boolean {
        return session.tokens.expiresAt
            ? Date.now() >= session.tokens.expiresAt
            : false;
    }

    private updateCache(session: UserSession): void {
        this.sessionCache = {
            session,
            timestamp: Date.now()
        };
    }

    private clearCache(): void {
        this.sessionCache = {
            session: null,
            timestamp: 0
        };
    }
}

export const sessionManager = SessionManager.getInstance()