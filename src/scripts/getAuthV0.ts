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

    /**
     * Fetch and return fresh session tokens from API
     */
    public async getSessionTokens(): Promise<UserSession | null> {
        console.group('[UserHelper] getSessionTokens')
        try {
            const response = await fetch('/api/v1/auth/signin', {
                method: 'GET',
                credentials: 'include'
            })

            if (!response.ok) {
                console.error('API Response Error:', response.status, response.statusText)
                return null
            }

            const data: SessionResponse = await response.json()

            if (!data?.session?.user) {
                console.error('Invalid session data:', data)
                return null
            }

            const userSession = this.mapResponseToUserSession(data)
            console.debug('Session data:', userSession)
            return userSession
        } catch (error) {
            console.error('Error fetching session tokens:', error)
            return null
        } finally {
            console.groupEnd()
        }
    }

    /**
     * Get complete session (from store or API)
     */
    public async getCompleteSession(): Promise<UserSession> {

        console.debug('[UserHelper] getCompleteSession')

        const storedUser = userStore.get()

        if (storedUser?.isAuthenticated && !this.isTokenExpired(storedUser)) {
            return storedUser
        }

        const freshSession = await this.getSessionTokens()
        const user = freshSession || this.getEmptyUser()

        userStore.set(user)
        return user
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