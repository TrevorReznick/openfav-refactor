import { supabase } from '@/providers/supabaseAuth'
import { currentPath, userStore } from '@/store'
import type { UserSession } from '~/types/users'

export class UserHelper {
  // ... (singleton e costruttore)

  // Ottiene i dati base dell'utente
  public getUserInfo(): UserSession {
    const user = userStore.get();

    console.log('[UserHelper] getUserInfo:', user);

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
      provider: user.app_metadata?.provider || 'email',
      tokens: {
        accessToken: null,
        refreshToken: null,
        expiresAt: 0
      },
      metadata: {
        provider: user.app_metadata?.provider || 'email',
        avatarUrl: user.user_metadata?.avatar_url
      }
    };
  }

  // Ottiene i token della sessione
  public async getSessionTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt?: number;
  }> {
    try {
      console.log('[UserHelper] Richiedo session tokens...');
      const response = await fetch('/api/v1/auth/signin', {
        method: 'GET',
        credentials: 'include'
      });
      const { session } = await response.json();

      console.log('[UserHelper] Risposta tokens:', session);

      return {
        accessToken: session?.access_token || null,
        refreshToken: session?.refresh_token || null,
        expiresAt: session?.expires_at
      };
    } catch (error) {
      console.error('[UserHelper] Error getting session tokens:', error);
      return {
        accessToken: null,
        refreshToken: null
      };
    }
  }

  // Ottiene informazioni complete (utente + sessione)
  public async getCompleteSession(): Promise<UserSession> {
    console.log('[UserHelper] getCompleteSession - Inizio');
    const userInfo = this.getUserInfo();
    const tokens = await this.getSessionTokens();

    console.log('[UserHelper] getCompleteSession - Risultato:', { ...userInfo, tokens });
    return {
      ...userInfo,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt ?? 0 // or another default number if preferred
      }
    };
  }

  // Verifica se l'utente è autenticato
  public isAuthenticated(): boolean {
    const auth = !!userStore.get();
    console.log('[UserHelper] isAuthenticated:', auth);
    return auth;
  }

  // Verifica se il token è scaduto
  public isTokenExpired(): boolean {
    const user = userStore.get();
    if (!user) return true;

    const expiresAt = user.exp;
    const isExpired = expiresAt ? Date.now() >= expiresAt * 1000 : true;
    console.log('[UserHelper] isTokenExpired:', isExpired);
    return isExpired;
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
      provider: 'email',
      tokens: {
        accessToken: null,
        refreshToken: null,
        expiresAt: 0
      },
      metadata: {
        provider: 'email',
        avatarUrl: undefined
      }
    };
  }
}