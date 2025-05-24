import { defineMiddleware } from 'astro:middleware'
import * as store from '@/store'

const userStoreGet = store.userStore.get()
const apiUrl = import.meta.env.PUBLIC_API_URL

export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {

    /* @@ manage paths @@ */

    store.previousPath.set(store.currentPath.get())
    store.currentPath.set(url.pathname)

    const from = store.previousPath.get()
    const to = store.currentPath.get()

    return next()
})