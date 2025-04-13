import { defineMiddleware } from 'astro:middleware'
import * as store from '@/store'

export const onRequest = defineMiddleware(async ({ url, redirect }, next) => {
  /* @@ manage paths @@ */

  //console.log('hello from middleware path name', url.pathname)
  store.previousPath.set(store.currentPath.get())
  store.currentPath.set(url.pathname)

  const from = store.previousPath.get()
  const to = store.currentPath.get()
  console.log('verify store', 'pathname', url.pathname, 'from --', from, '-- to --', to, ' --')

  if (from === '/auth' && to === '/') {
    console.log('middlware says authenticated')
    return redirect('/build/authenthicated')
  }

  if (from === '/api/v1/auth/signin' && to === '/protected/page') {
    console.log('middleware caught redirected auth page!')
    //return redirect('/build/authenthicated')
  }



  return next()
})
