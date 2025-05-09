export interface UserMetadata {
    avatar_url: string  // Da GitHub
    email: string
    email_verified: boolean
    iss?: string  // Opzionale (es. "https://api.github.com")
    phone_verified?: boolean
    preferred_username: string  // Da GitHub
    provider_id: string  // ID del provider (es. "77993006")
    sub: string  // Subject ID (es. "77993006")
    user_name: string  // Da GitHub
    [key: string]: any  // Flessibilità per campi aggiuntivi
}

export interface AppMetadata {
    provider: "email" | "github"  // Specifica i provider possibili
    providers: ("email" | "github")[]  // Array di provider
    [key: string]: any
}