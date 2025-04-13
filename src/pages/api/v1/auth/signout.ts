import type { APIRoute } from 'astro'
import { isAuthenticated } from '~/store'

export const GET: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('sb-access-token', { path: '/' })
  cookies.delete('sb-refresh-token', { path: '/' })
  isAuthenticated.set(false)
  return redirect('/login')
};
