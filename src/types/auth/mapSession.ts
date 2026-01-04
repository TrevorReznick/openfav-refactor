import type { SessionResponse } from '@/types/auth/session'
import type { User, UserSession } from '@/types/auth/userSession'

export const mapSessionToUserSession = (data: SessionResponse): UserSession => {
    if (!data.session.user) throw new Error("User not found in session")

    return {
        id: data.session.user.id,
        email: data.user.email,
        fullName: data.session.user.user_metadata.preferred_username || data.session.user.email.split("@")[0],
        createdAt: new Date(data.session.user.created_at),
        lastLogin: new Date(data.session.user.last_sign_in_at),
        isAuthenticated: !!data.session.access_token,
        provider: data.session.user.app_metadata.provider,
        tokens: {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at * 1000,  // Converti in ms
        },
        metadata: {
            avatarUrl: data.session.user.user_metadata.avatar_url,
            githubUsername: data.session.user.user_metadata.user_name,
        },
    }
}