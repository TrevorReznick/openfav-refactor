import { redis } from '~/providers/old/upstashRedis'

// Session expiration time in seconds (default: 24 hours)
const SESSION_TTL = 60 * 60 * 24

/**
 * Handle GET request to retrieve session data
 * @param request Incoming request object
 * @returns Response with session data or error
 */
export async function handleSessionGet(request: Request): Promise<Response> {
    try {
        // Extract session ID from request (from cookie or authorization header)
        const url = new URL(request.url)
        const sessionId = url.searchParams.get('sessionId') || extractSessionFromCookies(request)

        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'Session ID not provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Get session data from Redis
        const key = `session:${sessionId}`
        const sessionData = await redis.get<string>(key)

        if (!sessionData) {
            return new Response(JSON.stringify({ error: 'Session not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Parse and return session data
        const userData = JSON.parse(sessionData)

        // Refresh session TTL
        await redis.expire(key, SESSION_TTL)

        return new Response(JSON.stringify({
            session: userData,
            status: 'success'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('Error handling session GET:', error)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

/**
 * Handle POST request to create or update session data
 * @param request Incoming request object
 * @returns Response with operation result
 */
export async function handleSessionPost(request: Request): Promise<Response> {
    try {
        // Parse request body
        const body = await request.json()
        const { sessionId, userData, ttl = SESSION_TTL } = body

        if (!sessionId || !userData) {
            return new Response(JSON.stringify({ error: 'Session ID and user data are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Store session data in Redis
        const key = `session:${sessionId}`
        const serializedData = JSON.stringify(userData)

        await redis.set(key, serializedData, { ex: ttl })

        // Set session cookie
        const headers = new Headers({ 'Content-Type': 'application/json' })
        headers.append('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ttl}`)

        return new Response(JSON.stringify({
            status: 'success',
            message: 'Session created/updated successfully'
        }), {
            status: 200,
            headers
        })
    } catch (error) {
        console.error('Error handling session POST:', error)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

/**
 * Handle DELETE request to remove session data
 * @param request Incoming request object
 * @returns Response with operation result
 */
export async function handleSessionDelete(request: Request): Promise<Response> {
    try {
        // Extract session ID from request
        const url = new URL(request.url)
        const sessionId = url.searchParams.get('sessionId') || extractSessionFromCookies(request)

        if (!sessionId) {
            return new Response(JSON.stringify({ error: 'Session ID not provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Delete session from Redis
        const key = `session:${sessionId}`
        await redis.del(key)

        // Clear session cookie
        const headers = new Headers({ 'Content-Type': 'application/json' })
        headers.append('Set-Cookie', 'sessionId=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0')

        return new Response(JSON.stringify({
            status: 'success',
            message: 'Session deleted successfully'
        }), {
            status: 200,
            headers
        })
    } catch (error) {
        console.error('Error handling session DELETE:', error)
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

/**
 * Extract session ID from cookies
 * @param request Incoming request
 * @returns Session ID or null
 */
function extractSessionFromCookies(request: Request): string | null {
    const cookies = request.headers.get('cookie')
    if (!cookies) return null

    const sessionCookie = cookies.split(';')
        .find(cookie => cookie.trim().startsWith('sessionId='))

    if (!sessionCookie) return null

    return sessionCookie.split('=')[1].trim()
}

// Export Redis instance for direct access if needed
export { redis }
