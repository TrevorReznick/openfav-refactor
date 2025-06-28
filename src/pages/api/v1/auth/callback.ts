import type { APIRoute } from 'astro'
import { supabase } from '~/providers/supabaseAuth'

export const GET: APIRoute = async ({ url, cookies, redirect, request }) => {
  const authCode = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error)}`)
  }

  // If we have a code, exchange it for a session
  if (authCode) {
    try {
      const { data, error: authError } = await supabase.auth.exchangeCodeForSession(authCode)

      if (authError) {
        console.error('Error exchanging code for session:', authError)
        return redirect(`/login?error=auth_failed`)
      }

      const { access_token, refresh_token } = data.session

      // Set secure, httpOnly cookies
      cookies.set('sb-access-token', access_token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })

      cookies.set('sb-refresh-token', refresh_token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })

      // Redirect to the original URL or dashboard
      const redirectTo = url.searchParams.get('redirect_to') || '/dashboard'
      return redirect(redirectTo)

    } catch (error) {
      console.error('Error in auth callback:', error)
      return redirect(`/login?error=callback_failed`)
    }
  }

  // If no code, redirect to login
  return redirect('/login')
}