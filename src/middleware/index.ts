import { defineMiddleware } from 'astro:middleware'
import { UserHelper } from '@/scripts/auth/getAuth'

export const onRequest = defineMiddleware(async ({ url, redirect }, next) => {
    const protectedPaths = ['/build/dashboard', '/admin']
    const authPaths = ['/login', '/register', '/api/auth/']

    if (authPaths.some((path) => url.pathname.startsWith(path)) || url.pathname === '/') {
        console.log('[middleware] Accesso a rotta pubblica:', url.pathname)
        return next()
    }

    if (protectedPaths.some((path) => url.pathname.startsWith(path))) {
        try {
            const userHelper = new UserHelper()
            const userSession = await userHelper.getCompleteSession()

            if (!userSession.isAuthenticated) {
                return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`)
            }

            if (userHelper.isTokenExpired()) {
                const refreshed = await userHelper.refreshToken()
                if (!refreshed) {
                    return redirect('/login?session=expired')
                }

                if (userHelper.isTokenExpired()) {
                    return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}&session=expired`)
                }
            }

            // Verifica ruoli se necessario
            /*if (url.pathname.startsWith('/admin')) {
                if (!userHelper.checkRole('admin')) {
                    return redirect('/unauthorized')
                }
            }
            */

        } catch (error) {
            console.error('[middleware] Auth error:', error)
            return redirect('/login?error=auth_failed')
        }
    }

    return next()
})