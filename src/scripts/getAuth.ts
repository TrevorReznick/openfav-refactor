import { supabase } from '@/providers/supabaseAuth'
import { currentPath, userStore } from '@/store'
import type {UserSession} from '@/types/userSession'


export class UserHelper {
    private static instance: UserHelper
    
  
    private constructor() {}

    public static getInstance(): UserHelper {
        if (!UserHelper.instance) {
        UserHelper.instance = new UserHelper();
        }
        return UserHelper.instance;
}

    // Ottiene i dati base dell'utente
    public getUserInfo(): UserSession {
        const user = userStore.get();
        
        if (!user) {
            return this.getEmptyUser();
        }

        return {
            
            id: user.id,
            email: user.email,
            fullName: user.user_metadata?.full_name || 'Utente',
            createdAt: new Date(user.created_at),
            lastLogin: new Date(user.last_sign_in_at),
            isAuthenticated: true,
            metadata: {
                provider: user.app_metadata?.provider || 'email',
                avatarUrl: user.user_metadata?.avatar_url
            }
        }
        


  }

  // Ottiene i token della sessione
  public async getSessionTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt?: number;
  }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return {
        accessToken: session?.access_token || null,
        refreshToken: session?.refresh_token || null,
        expiresAt: session?.expires_at
      };
    } catch (error) {
      console.error('Error getting session tokens:', error);
      return {
        accessToken: null,
        refreshToken: null
      };
    }
  }

  // Ottiene informazioni complete (utente + sessione)
  public async getCompleteSession(): Promise<UserSession> {
    const userInfo = this.getUserInfo();
    const tokens = await this.getSessionTokens();

    return {
      ...userInfo,
      tokens
    };
  }

  // Verifica se l'utente è autenticato
  public isAuthenticated(): boolean {
    return !!userStore.get();
  }

  // Verifica se il token è scaduto
  public isTokenExpired(): boolean {
    const user = userStore.get();
    if (!user) return true;

    const expiresAt = user.exp; // timestamp di scadenza
    return expiresAt ? Date.now() >= expiresAt * 1000 : true;
  }

  // Utente vuoto per stato iniziale/logout
  private getEmptyUser(): UserSession {
    return {
      id: '',
      email: '',
      fullName: '',
      createdAt: new Date(),
      lastLogin: new Date(),
      isAuthenticated: false,
      tokens: {
        accessToken: null,
        refreshToken: null
      }
    };
  }
}

// Esempio di utilizzo:
const userHelper = UserHelper.getInstance();

// In un componente o servizio
async function checkUserStatus() {
  if (userHelper.isAuthenticated()) {
    const session = await userHelper.getCompleteSession();
    console.log('User session:', {
      userId: session.id,
      email: session.email,
      accessToken: session.tokens?.accessToken,
      expiresAt: session.tokens?.expiresAt
    });

    if (userHelper.isTokenExpired()) {
      console.log('Token is expired, needs refresh');
    }
  }
}

// Uso più semplice per componenti
/*
function UserProfile() {
  const user = userHelper.getUserInfo();
  
  return user.isAuthenticated ? (
    <div>
      <h1>Welcome {user.fullName}</h1>
      <p>Email: {user.email}</p>
      <p>Member since: {user.createdAt.toLocaleDateString()}</p>
      <p>Last login: {user.lastLogin.toLocaleDateString()}</p>
      {user.metadata?.avatarUrl && (
        <img src={user.metadata.avatarUrl} alt="Profile" />
      )}
    </div>
  ) : (
    <div>Please log in</div>
  );
}
*/