// src/pages/api/doQueriesNew.ts

import type { APIRoute } from 'astro'
import { makeHandleRequest } from '@/scripts/http/handleRequest'
import { getSites } from '@/scripts/db_new/sites'


// --- Definizione della callback API ---
const apiRouter = async (
    method: string,
    type: string,
    params: Record<string, string>,
    request?: Request
): Promise<any> => {
    const data = request ? await request.json().catch(() => ({})) : {}

    switch (type) {

        case 'getSites':
            if (method !== 'GET') throw new Error('Invalid method for getSites')
            return await getSites()

        default:
            throw new Error(`Unknown operation type: ${type}`)

    }
}

// --- Genera il middleware handleRequest ---
const handleRequest = makeHandleRequest(apiRouter)

// --- Esponi i metodi HTTP ---
export const GET: APIRoute = async ({ url }) => {
    return await handleRequest('GET', url)
}

export const POST: APIRoute = async ({ request, url }) => {
    return await handleRequest('POST', url, request)
}

export const PUT: APIRoute = async ({ request, url }) => {
    return await handleRequest('PUT', url, request)
}

export const DEL: APIRoute = async ({ url }) => {
    return await handleRequest('DELETE', url)
}