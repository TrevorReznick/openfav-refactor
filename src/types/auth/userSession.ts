export interface UserSession {

    id: string
    email: string
    fullName: string  // Mappato da user_metadata.preferred_username
    createdAt: Date  // Convertito da user.created_at
    lastLogin: Date  // Convertito da user.last_sign_in_at
    isAuthenticated: boolean  // Deriva da access_token != null
    provider: "email" | "github"  // Da app_metadata.provider
    tokens: {
        accessToken: string
        refreshToken: string
        expiresAt: number  // Timestamp in ms
    }
    metadata: {
        avatarUrl?: string  // Da user_metadata.avatar_url
        githubUsername?: string  // Esempio di campo derivato
    }
}