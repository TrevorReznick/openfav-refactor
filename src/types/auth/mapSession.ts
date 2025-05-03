import type { SessionResponse } from '@/types/auth/session'
import type { UserSession } from '@/types/auth/userSession'

export const mapSessionToUserSession = (data: SessionResponse): UserSession => {
    if (!data.user) throw new Error("User not found in session")

    return {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata.preferred_username || data.user.email.split("@")[0],
        createdAt: new Date(data.user.created_at),
        lastLogin: new Date(data.user.last_sign_in_at),
        isAuthenticated: !!data.access_token,
        provider: data.user.app_metadata.provider,
        tokens: {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at * 1000,  // Converti in ms
        },
        metadata: {
            avatarUrl: data.user.user_metadata.avatar_url,
            githubUsername: data.user.user_metadata.user_name,
        },
    }
}