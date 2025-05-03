import type { AppMetadata, UserMetadata } from '@/types/auth/metadata'

export interface Identity {
    identity_id: string
    id: string
    user_id: string
    identity_data: {
        email: string
        email_verified: boolean
        phone_verified?: boolean
        sub: string
        [key: string]: any
    }
    provider: "email" | "github"
    last_sign_in_at: string
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    aud: "authenticated"  // Valore fisso
    role: "authenticated"
    email: string
    email_confirmed_at: string
    phone: string
    confirmed_at: string
    last_sign_in_at: string
    app_metadata: AppMetadata
    user_metadata: UserMetadata
    identities: Identity[]
    created_at: string
    updated_at: string
    is_anonymous: boolean
}

export interface SessionResponse {
    session: {
        access_token: string
        token_type: "bearer"
        expires_in: number
        expires_at: number
        refresh_token: string
        user: User  // Obbligatorio (se la sessione è valida)
    }
}