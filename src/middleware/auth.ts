import { defineMiddleware } from 'astro:middleware'
import { UserHelper } from '@/auth/getAuth'


export const onRequest = defineMiddleware(async ({ url, redirect }, next) => {

    const protectedPaths = ['/test-build/dashboard', '/admin']
    const authPaths = ['/login', '/register', '/api/auth/']

    // Bypassa rotte pubbliche
    if (authPaths.some((path) => url.pathname.startsWith(path))) {

        console.log('🔓 Accesso a rotta pubblica:', url.pathname)
        return next()

    }

    // Controlla solo le rotte protette
    // Esempio di miglioramento
    if (protectedPaths.some((path) => url.pathname.startsWith(path))) {
        try {
            const userHelper = UserHelper.getInstance();
            const userSession = await userHelper.getCompleteSession();

            if (!userSession.isAuthenticated) {
                return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
            }

            if (userHelper.isTokenExpired(userSession)) {
                // Tentativo di refresh del token
                const refreshed = await userHelper.refreshToken();
                if (!refreshed) {
                    return redirect('/login?session=expired');
                }
            }

            // Verifica ruoli se necessario
            if (url.pathname.startsWith('/admin') && !userSession.roles?.includes('admin')) {
                return redirect('/unauthorized');
            }

        } catch (error) {
            console.error('Auth error:', error);
            return redirect('/login?error=auth_failed');
        }
    }

    // Procedi con la richiesta
    return next()
})