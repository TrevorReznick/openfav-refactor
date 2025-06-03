import type { APIRoute } from 'astro'
import {
    getSites,
    getSiteById,
    getSitesByUserId,
    insertSite,
    updateSite,
    deleteSite
} from '@/scripts/query_functions/sites' // Importa funzioni dal V1
import type { ApiResponse } from '@/types/api'

// Definizione dei tipi per il routing
type ApiRequestType =
    | 'getSites'
    | 'getSiteById'
    | 'getSitesByUserId'
    | 'insertSite'
    | 'updateSite'
    | 'deleteSite'

// Mapping tra tipo e funzione
const apiHandlers = {
    getSites: async (params: URLSearchParams) => await getSites(),
    getSiteById: async (params: URLSearchParams) => {
        const id = params.get('id')
        if (!id) throw new Error('Missing ID parameter')
        return await getSiteById(id)
    },
    getSitesByUserId: async (params: URLSearchParams) => {
        const userId = params.get('userId')
        if (!userId) throw new Error('Missing userId parameter')
        return await getSitesByUserId(userId)
    },
    insertSite: async (params: URLSearchParams, request: Request) => {
        const data = await request.json()
        return await insertSite(data)
    },
    updateSite: async (params: URLSearchParams, request: Request) => {
        const id = params.get('id')
        if (!id) throw new Error('Missing ID parameter')
        const data = await request.json()
        return await updateSite(id, data)
    },
    deleteSite: async (params: URLSearchParams) => {
        const id = params.get('id')
        if (!id) throw new Error('Missing ID parameter')
        return await deleteSite(id)
    }
}

export const GET: APIRoute = async ({ url }) => {
    return handleApiRequest(url, 'GET')
}

export const POST: APIRoute = async ({ url, request }) => {
    return handleApiRequest(url, 'POST', request)
}

export const PUT: APIRoute = async ({ url, request }) => {
    return handleApiRequest(url, 'PUT', request)
}

export const DELETE: APIRoute = async ({ url }) => {
    return handleApiRequest(url, 'DELETE')
}

async function handleApiRequest(url: URL, method: string, request?: Request): Promise<Response> {
    try {
        const { type, ...params } = Object.fromEntries(url.searchParams)

        const typedType = type as ApiRequestType

        if (!(typedType in apiHandlers)) {
            return jsonError('Unknown API request type')
        }

        const handler = apiHandlers[typedType]

        let result: any

        if (method === 'GET' || method === 'DELETE') {
            result = await handler(new URLSearchParams(params), request)
        } else {
            result = await handler(new URLSearchParams(params), request)
        }

        return jsonResponse(result)

    } catch (error: any) {
        console.error(`API route error [${url.searchParams}]`, error)
        return jsonError(error.message || 'Internal server error')
    }
}

function jsonResponse<T>(data: T): Response {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

function jsonError(message: string, status = 500): Response {
    return new Response(
        JSON.stringify({
            success: false,
            error: message
        }),
        {
            status,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
}