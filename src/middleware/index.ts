import { defineMiddleware } from 'astro:middleware'
import * as store from '@/store'

const userStoreGet = store.userStore.get()

export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {

  /* @@ manage paths @@ */

  //console.log('hello from middleware path name', url.pathname)
  store.previousPath.set(store.currentPath.get())
  store.currentPath.set(url.pathname)

  const from = store.previousPath.get()
  const to = store.currentPath.get()
  console.log(`Middleware navigation: from "${from}" to "${to}" (current path: "${url.pathname}")`)

  if (from === '/api/v1/auth/signin' && to === '/auth') {
    console.log('middlware says authenticated')
    return redirect('/auth')
  }

  if (from === '/api/v1/auth/signin' && to === '/test/main') {
    console.log('middleware caught redirected auth page!')
    //return redirect('/build/authenthicated')
  }

  //const apiUrl = import.meta.env.MODE === 'production' ? import.meta.env.PUBLIC_PROD_API_URL : import.meta.env.PUBLIC_DEV_API_URL
  const apiUrl = import.meta.env.PUBLIC_API_URL

  //console.log('📦 Checking store:', userStoreGet)


  //TODO set global var 
  return next()
})
