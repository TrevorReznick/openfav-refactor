import { defineMiddleware } from 'astro:middleware'
import * as store from '@/store'

export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {

  /* @@ manage paths @@ */

  //console.log('hello from middleware path name', url.pathname)
  store.previousPath.set(store.currentPath.get())
  store.currentPath.set(url.pathname)

  const from = store.previousPath.get()
  const to = store.currentPath.get()
  console.log('middleware path', url.pathname, ': <-- from: ', from, '--> to: ', to, '')
  if (from === '/api/v1/auth/signin' && to === '/test/test') {
    console.log('middleware caught redirected auth page!')
    //return redirect('/build/authenthicated')
  }
  /*
  if (from === '/auth' && to === '/') {
    console.log('middlware says authenticated')
    return redirect('/build/authenthicated')
  }
  
  */
  //TODO set global var 
  return next()
})
