export interface UserSession {
    id: string | null
    email: string | null
    fullName: string | null  // Mappato da user_metadata.preferred_username
    createdAt: Date | null  // Convertito da user.created_at
    lastLogin: Date | null  // Convertito da user.last_sign_in_at
    isAuthenticated: boolean  // Indica se l'utente è autenticato
    provider: string | null  // Da app_metadata.provider
    tokens: {
        accessToken: string | null
        refreshToken: string | null
        expiresAt: number  // Timestamp in ms
    }
    metadata: {
        provider?: string | null
        avatarUrl?: string | null  // Da user_metadata.avatar_url
        githubUsername?: string | null  // Esempio di campo derivato
    }
    // Campi opzionali per compatibilità
    user_metadata?: any | null
    app_metadata?: any | null
}
