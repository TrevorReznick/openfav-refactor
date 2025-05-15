import { userStore } from '@/store'
import type { SessionResponse } from '~/types/auth/session'
import type { UserSession } from '~/types/auth/userSession'
import type { User } from '@/types/auth/session'

export class UserHelper {

    private static instance: UserHelper

    private constructor() { }

    public static getInstance(): UserHelper {

        if (!UserHelper.instance) {
            UserHelper.instance = new UserHelper()
        }

        return UserHelper.instance
    }

    //#region Public Methods

    /**
     * Get formatted user info from store
    */
    public getUserInfo(): UserSession {

        const user = userStore.get()

        console.debug('[UserHelper] getUserInfo:', user)

        return user ? this.mapToUserSession(user) : this.getEmptyUser()
    }

    // Aggiungi questa costante all'inizio del file
    private static readonly SESSION_PREFIX = 'user_session_';

    /**
     * Salva i token di sessione in Redis
    */
    public async saveSessionToRedis(userId: string, userSession: UserSession): Promise<boolean> {
        console.debug('[UserHelper] saveSessionToRedis');
        try {
            const redisApiUrl = import.meta.env.PUBLIC_REDIS_API_URL;
            // Usa il formato corretto della chiave con il prefisso
            const sessionKey = `${UserHelper.SESSION_PREFIX}${userId}`;

            // Crea l'oggetto sessione nel formato corretto
            const sessionData = {
                session: {
                    id: userSession.id,
                    email: userSession.email,
                    fullName: userSession.fullName,
                    createdAt: userSession.createdAt?.toISOString(),
                    lastLogin: userSession.lastLogin?.toISOString(),
                    isAuthenticated: userSession.isAuthenticated,
                    provider: userSession.provider,
                    tokens: {
                        accessToken: userSession.tokens.accessToken,
                        refreshToken: userSession.tokens.refreshToken,
                        expiresAt: userSession.tokens.expiresAt // già in millisecondi
                    },
                    metadata: {
                        provider: userSession.metadata.provider,
                        avatarUrl: userSession.metadata.avatarUrl,
                        githubUsername: userSession.metadata.githubUsername
                    }
                },
                expirySeconds: 3600 // 1 ora di scadenza
            };

            const response = await fetch(`${redisApiUrl}/set-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            if (!response.ok) {
                console.error('Failed to save session to Redis:', response.status);
                return false;
            }

            console.debug('Session saved to Redis successfully');
            return true;
        } catch (error) {
            console.error('Error saving session to Redis:', error);
            return false;
        }
    }

    /**
     * Recupera i token di sessione da Redis
     */
    public async getSessionFromRedis(userId: string): Promise<UserSession | null> {
        console.debug('[UserHelper] getSessionFromRedis');
        try {
            const redisApiUrl = import.meta.env.PUBLIC_REDIS_API_URL;
            // Usa il formato corretto della chiave con il prefisso
            const sessionKey = `${UserHelper.SESSION_PREFIX}${userId}`;

            const response = await fetch(`${redisApiUrl}/session/${sessionKey}`);

            if (!response.ok) {
                console.debug('No session found in Redis or error:', response.status);
                return null;
            }

            const data = await response.json();
            console.debug('Session retrieved from Redis:', data);

            // Estrai la sessione dall'oggetto risposta
            if (data && data.session) {
                const session = data.session;

                // Converti le stringhe ISO in oggetti Date
                return {
                    id: session.id,
                    email: session.email,
                    fullName: session.fullName,
                    createdAt: new Date(session.createdAt),
                    lastLogin: new Date(session.lastLogin),
                    isAuthenticated: session.isAuthenticated,
                    provider: session.provider,
                    tokens: {
                        accessToken: session.tokens.accessToken,
                        refreshToken: session.tokens.refreshToken,
                        expiresAt: session.tokens.expiresAt
                    },
                    metadata: {
                        provider: session.metadata.provider,
                        avatarUrl: session.metadata.avatarUrl,
                        githubUsername: session.metadata.githubUsername
                    }
                };
            }

            return null;
        } catch (error) {
            console.error('Error getting session from Redis:', error);
            return null;
        }
    }

    /**
     * Elimina la sessione da Redis
     */
    public async deleteSessionFromRedis(userId: string): Promise<boolean> {
        console.debug('[UserHelper] deleteSessionFromRedis');
        try {
            const redisApiUrl = import.meta.env.PUBLIC_REDIS_API_URL;
            // Usa il formato corretto della chiave con il prefisso
            const sessionKey = `${UserHelper.SESSION_PREFIX}${userId}`;

            const response = await fetch(`${redisApiUrl}/session/${sessionKey}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                console.error('Failed to delete session from Redis:', response.status);
                return false;
            }

            console.debug('Session deleted from Redis successfully');
            return true;
        } catch (error) {
            console.error('Error deleting session from Redis:', error);
            return false;
        }
    }
   
    /**
        * Fetch and return fresh session tokens from API
    */
    public async getSessionTokens(): Promise<UserSession | null> {
        console.group('[UserHelper] getSessionTokens');
        try {
            // Prima controlla se c'è un utente nello store
            const storedUser = userStore.get();

            // Se abbiamo un ID utente, proviamo a recuperare la sessione da Redis
            if (storedUser?.id) {
                const redisSession = await this.getSessionFromRedis(storedUser.id);

                if (redisSession?.tokens?.accessToken && !this.isTokenExpiredFromTimestamp(redisSession.tokens.expiresAt)) {
                    console.debug('Using session from Redis');

                    // Crea un oggetto UserSession dai dati Redis
                    return {
                        ...storedUser,
                        isAuthenticated: true,
                        tokens: {
                            accessToken: redisSession.tokens.accessToken,
                            refreshToken: redisSession.tokens.refreshToken,
                            expiresAt: redisSession.tokens.expiresAt
                        }
                    };
                }
            }

            // Se non abbiamo trovato una sessione valida in Redis, procedi con l'autenticazione Supabase
            const response = await fetch('/api/v1/auth/signin', {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                console.error('API Response Error:', response.status, response.statusText);
                return null;
            }

            const data: SessionResponse = await response.json();

            if (!data?.session?.user) {
                console.error('Invalid session data:', data);
                return null;
            }

            const userSession = this.mapResponseToUserSession(data);
            console.debug('Session data from API:', userSession);

            // Salva la sessione in Redis se abbiamo un ID utente
            if (userSession.id && userSession.tokens.accessToken) {
                await this.saveSessionToRedis(userSession.id, userSession);
            }

            return userSession;
        } catch (error) {
            console.error('Error fetching session tokens:', error);
            return null;
        } finally {
            console.groupEnd();
        }
    }

    // Aggiungi questo metodo di utilità
    private isTokenExpiredFromTimestamp(expiresAt?: number): boolean {
        if (!expiresAt) return true;
        return Date.now() >= expiresAt * 1000;
    }

    /**
 * Get complete session (from store, Redis or API)
 */
public async getCompleteSession(): Promise<UserSession> {
    this.logAuthState('Inizio recupero sessione completa');
    
    // 1. Controlla se c'è un utente nello store locale
    const storedUser = userStore.get();
    this.logAuthState('Utente nello store locale', storedUser?.id || 'Nessun utente');

    // 2. Se l'utente è autenticato e il token è valido, restituiscilo
    if (storedUser?.isAuthenticated && !this.isTokenExpired(storedUser)) {
        this.logAuthState('Trovata sessione valida nello store locale');
        return storedUser;
    }

    // 3. Se c'è un utente ma il token è scaduto, prova a recuperare da Redis
    if (storedUser?.id) {
        try {
            this.logAuthState('Tentativo di recupero sessione da Redis', { userId: storedUser.id });
            const redisSession = await this.getSessionFromRedis(storedUser.id);
            
            if (redisSession && !this.isTokenExpired(redisSession)) {
                this.logAuthState('Sessione recuperata da Redis con successo', { 
                    userId: redisSession.id,
                    expiresAt: redisSession.tokens.expiresAt 
                });
                userStore.set(redisSession);
                return redisSession;
            }
        } catch (error) {
            this.logAuthState('Errore nel recupero da Redis', error);
            // Continua con il normale flusso di autenticazione
        }
    }

    // 4. Se non c'è una sessione valida, prova a ottenerne una nuova
    this.logAuthState('Nessuna sessione valida trovata, richiedo nuovi token');
    try {
        const freshSession = await this.getSessionTokens();
        
        if (freshSession) {
            this.logAuthState('Nuova sessione ottenuta con successo', { 
                userId: freshSession.id 
            });
            
            // Salva la nuova sessione in Redis in background
            this.saveSessionToRedis(freshSession.id, freshSession)
                .catch(error => 
                    this.logAuthState('Errore nel salvataggio su Redis', error)
                );
                
            userStore.set(freshSession);
            return freshSession;
        }
    } catch (error) {
        this.logAuthState('Errore nel recupero della sessione', error);
        throw error;
    }

    // 5. Se tutto il resto fallisce, restituisci un utente vuoto
    this.logAuthState('Nessuna sessione valida trovata, restituisco utente vuoto');
    const emptyUser = this.getEmptyUser();
    userStore.set(emptyUser);
    return emptyUser;
}
    /**
     * Check if user is authenticated
     */
    public isAuthenticated(): boolean {
        const user = userStore.get()
        return !!user?.isAuthenticated
    }

    /**
     * Check if token is expired
     */
    public isTokenExpired(user?: UserSession): boolean {
        const targetUser = user || userStore.get()
        if (!targetUser?.tokens?.expiresAt) return true

        const expirationTime = targetUser.tokens.expiresAt * 1000
        const isExpired = Date.now() >= expirationTime

        console.debug('[UserHelper] isTokenExpired:', isExpired)
        return isExpired
    }

    //#endregion

    //#region Private Methods

    /**
     * Map API response to UserSession format
     */
    private mapResponseToUserSession(data: any): UserSession {
        // Verifica prima la struttura completa
        if (!data || (!data.access_token && !data.session?.access_token)) {
            throw new Error('Dati di sessione non validi: token mancanti');
        }

        // Estrai i token dalla struttura corretta
        const tokens = {
            accessToken: data.access_token || data.session?.access_token,
            refreshToken: data.refresh_token || data.session?.refresh_token,
            expiresAt: data.expires_at || data.session?.expires_at
        };

        // Verifica che i token siano presenti
        if (!tokens.accessToken || !tokens.refreshToken || !tokens.expiresAt) {
            throw new Error('Token mancanti nella risposta');
        }

        const userData = data.user || data.session?.user;
        if (!userData) {
            throw new Error('Dati utente mancanti');
        }

        return {
            id: userData.id,
            email: userData.email,
            fullName: userData.user_metadata?.preferred_username || userData.email.split('@')[0],
            createdAt: new Date(userData.created_at),
            lastLogin: new Date(userData.last_sign_in_at),
            isAuthenticated: true,
            provider: 'email',
            tokens: tokens,
            metadata: {
                provider: userData.app_metadata?.provider || 'email',
                avatarUrl: userData.user_metadata?.avatar_url
            }
        };
    }

    /**
     * Map stored user to UserSession format
     */
    private mapToUserSession(user: User): UserSession {
        return {
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.preferred_username || 'Utente',
            createdAt: new Date(user.created_at),
            lastLogin: new Date(user.last_sign_in_at),
            isAuthenticated: true,
            provider: 'email',
            tokens: {
                accessToken: null, // Replace with the correct property if available in the User type
                refreshToken: null,
                expiresAt: 0
            },
            metadata: {
                provider: user.app_metadata?.provider || 'email',
                avatarUrl: user.user_metadata?.avatar_url
            }
        }
    }

    private logAuthState(message: string, data?: any) {
        console.log(`[Auth] ${message}`, data || '')
    }

    /**
     * Return empty user session
    */
    private getEmptyUser(): UserSession {
        return {
            id: '',
            email: '',
            fullName: 'Utente',
            createdAt: new Date(),
            lastLogin: new Date(),
            isAuthenticated: false,
            provider: 'email',
            tokens: {
                accessToken: null,
                refreshToken: null,
                expiresAt: 0,
            },
            metadata: {
                provider: 'email',
                avatarUrl: undefined
            }
        }
    }

    //#endregion
}