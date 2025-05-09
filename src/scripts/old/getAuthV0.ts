import { supabase } from '@/providers/supabaseAuth'
import { currentPath, userStore } from '@/store'
import type { UserSession } from '~/types/old/userSession'
import { UserHelper as ExternalUserHelper } from '~/scripts/getAuth'

export const authGuard = async (): Promise<boolean> => {
  console.group('🔒 Auth Guard')
  try {
    const response = await fetch('/api/v1/auth/signin', {
      method: 'GET',
      credentials: 'include' // importante per includere i cookies
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    console.log('Client Session object:', data.session)
    console.log('Client Session check:', {
      isAuthenticated: !!data.session,
      currentPath: currentPath.get(),
      is_token: !!data.session?.access_token
    })
    return !!data.session
  } catch (error) {
    console.error('Auth Guard error:', error)
    return false
  } finally {
    console.groupEnd()
  }
}

export class LocalUserHelper {

  private static instance: LocalUserHelper

  private constructor() { }

  public static getInstance(): LocalUserHelper {
    if (!LocalUserHelper.instance) {
      LocalUserHelper.instance = new LocalUserHelper()
    }
    return LocalUserHelper.instance
  }

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
    }
  }

  public async getSessionTokens(): Promise<{
    accessToken: string | null
    refreshToken: string | null
    expiresAt?: number
  }> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return {
        accessToken: session?.access_token || null,
        refreshToken: session?.refresh_token || null,
        expiresAt: session?.expires_at
      }
    } catch (error) {
      console.error('Error getting session tokens:', error)
      return {
        accessToken: null,
        refreshToken: null
      }
    }
  }

  public getUserInfo(): UserSession {
    const user = userStore.get()

    if (!user) {
      return this.getEmptyUser()
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



}