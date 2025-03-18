import { defineMiddleware } from 'astro:middleware'
import * as store from '@/store'

export const onRequest = defineMiddleware(async ({ url }, next) => {
  /* @@ manage paths @@ */

  console.log('hello from middleware path name', url.pathname)
  store.previousPath.set(store.currentPath.get())
  store.currentPath.set(url.pathname)

  const from = store.previousPath.get()
  const to = store.currentPath.get()
  //console.log('verify store', 'pathname', url.pathname, 'from', from, 'to', to)

  return next()
})
