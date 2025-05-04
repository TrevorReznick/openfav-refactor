import type { APIRoute } from 'astro'
import { supabase } from '~/providers/supabaseAuth'
import type { Provider } from '@supabase/supabase-js'
import * as store from '~/store'

console.log('hello from signin.ts')

export const POST: APIRoute = async ({ request, cookies, redirect }) => {

  const formData = await request.formData()
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const provider = formData.get('provider')?.toString()

  if (provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: import.meta.env.PROD
          ? import.meta.env.PUBLIC_PROD_API_URL + 'auth/callback'
          : import.meta.env.PUBLIC_DEV_API_URL + 'auth/callback',
      },
    })
    if (!import.meta.env.DEV) {
      console.log('Stai in ambiente di produzione');
      console.log(import.meta.env.PUBLIC_PROD_API_URL + 'auth/callback')
    } else console.log('Stai in ambiente di sviluppo')

    if (error) {
      store.messageStore.set(`OAuth error: ${error.message}`)
      //return new Response(error.message, { status: 500 });
      return redirect('/login')
    }
    console.log('auth response data: ', data)
    return redirect(data.url)
  } else console.log('No provider selected, continue...')

  if (!email || !password) {
    //return new Response('Email and password are required', { status: 400 })
    //return redirect('/auth-error-page')
    store.messageStore.set('Email and password are required')
    return redirect('/login')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    store.messageStore.set(error.message)
    //return new Response(error.message, { status: 500 });
    return redirect('/login')
  }
  //TODO
  const { access_token, refresh_token } = data.session
  console.log('Access token:', access_token)
  cookies.set('sb-access-token', access_token, {
    sameSite: 'strict',
    path: '/',
    secure: true,
  })
  cookies.set('sb-refresh-token', refresh_token, {
    sameSite: 'strict',
    path: '/',
    secure: true,
  })
  console.log('user is logged in')

  return redirect('/test/test')
};

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get('sb-access-token')

  if (!accessToken) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}
