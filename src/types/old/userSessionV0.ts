export interface UserMetadata {
    avatar_url?: string;
    preferred_username?: string;
    [key: string]: any;
}

export interface AppMetadata {
    provider: string;
    [key: string]: any;
}

// types/userSessionV0.ts
export interface SessionResponse {
    access_token?: string; // Aggiunto optional
    refresh_token?: string;
    expires_at?: number;
    user?: { // Ora è opzionale
        id: string;
        email: string;
        created_at: string;
        last_sign_in_at: string;
        app_metadata: {
            provider: string;
            providers: string[];
        };
        user_metadata: {
            avatar_url?: string;
            preferred_username?: string;
        };
    };
}

export interface UserSession {
    id: string;
    email: string;
    fullName: string;
    createdAt: Date;
    lastLogin: Date;
    isAuthenticated: boolean;
    tokens: {
        accessToken: string | null | undefined
        refreshToken: string | null | undefined
        expiresAt: number | null | undefined
    };
    metadata: {
        provider: string;
        avatarUrl?: string;
    };
}