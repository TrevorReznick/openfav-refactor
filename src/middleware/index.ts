import { defineMiddleware } from 'astro:middleware'
import { UserHelper } from '@/auth/getAuth'


export const onRequest = defineMiddleware(async ({ url, redirect }, next) => {

    const protectedPaths = ['/build/dashboard', '/admin']
    const authPaths = ['/login', '/register', '/api/auth/']

    if (authPaths.some((path) => url.pathname.startsWith(path))) {

        console.log('[middleware] Accesso a rotta pubblica:', url.pathname)
        return next()

    }

    if (protectedPaths.some((path) => url.pathname.startsWith(path))) {
        try {
            const userHelper = UserHelper.getInstance();
            const userSession = await userHelper.getCompleteSession();

            if (!userSession.isAuthenticated) {
                return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
            }

            if (userHelper.isTokenExpired(userSession)) {
                const refreshed = await userHelper.refreshToken();
                if (!refreshed) {
                    return redirect('/login?session=expired');
                }
            }

            // In:
            if (userHelper.isTokenExpired(userSession)) {
                console.log('[middleware] Token scaduto, tentativo di refresh...');
                const refreshed = await userHelper.refreshToken();
                if (!refreshed) {
                    console.warn('[middleware] Refresh del token fallito, richiesta autenticazione');
                    return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}&session=expired`);
                }
                // Dopo il refresh, ottieni di nuovo la sessione aggiornata
                const updatedSession = await userHelper.getCompleteSession();
                if (!updatedSession.isAuthenticated || userHelper.isTokenExpired(updatedSession)) {
                    return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}&session=expired`);
                }
            }

            // Verifica ruoli se necessario
            if (url.pathname.startsWith('/admin')) {
                type UserMetadataWithRoles = {
                    provider?: string | null;
                    avatarUrl?: string;
                    githubUsername?: string;
                    roles?: string;
                };
                const userMetadata = userSession.metadata as UserMetadataWithRoles || {};
                const userRoles = (userMetadata.roles)?.split(',') || [];

                if (!userRoles.includes('admin')) {
                    console.warn('[middleware] Accesso negato: ruolo admin richiesto');
                    return redirect('/unauthorized');
                }
            }

        } catch (error) {
            console.error('[middleware] Auth error:', error);
            return redirect('/login?error=auth_failed');
        }
    }

    // Procedi con la richiesta
    return next()
})