import type { APIRoute } from 'astro'
import { userStore } from '~/store'

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('sb-access-token', { path: '/' })
  cookies.delete('sb-refresh-token', { path: '/' })
  userStore.set(null)
  return redirect('/auth')
}

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('sb-access-token', { path: '/' })
  cookies.delete('sb-refresh-token', { path: '/' })
  userStore.set(null)
  return redirect('/auth')
}