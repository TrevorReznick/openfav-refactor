import type { APIRoute } from 'astro'
import { getSites, getSiteById, getSitesByUserId } from '@/scripts/query_functions/getSites'
import { getLists, getListById, getListsByUserId } from '@/scripts/query_functions/getLists'
import { insertSite, updateSite } from '@/scripts/query_functions/postSite'
import type { CreateLinkRequest } from '@/types/api'

// HTTP methods exported for Astro
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

const handleRequest = async (method: string, url: URL, request?: Request) => {
  console.log(`[${method}] Request received:`, url.searchParams.toString())

  const { type, ...params } = Object.fromEntries(url.searchParams)

  try {
    const response = await handleApiRequest(method, type, params, request)

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error(`[${method}] Error:`, error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        type,
        params,
        timestamp: new Date().toISOString()
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

const handleApiRequest = async (method: string, type: string, params: any, request?: Request) => {
  try {
    const data = request ? await request.json().catch(() => ({})) : {}

    switch (type) {
      case 'getSites':
        if (method !== 'GET') throw new Error('Invalid method for getSites')
        return await getSites()
      case 'getSitesByUserId':
        if (method !== 'GET') throw new Error('Invalid method for getSitesByUserId')
        return await getSitesByUserId(params.userId)
      case 'getSite':
        if (method !== 'GET') throw new Error('Invalid method for getSites')
        return await getSiteById(params.id)
      case 'getLists':
        if (method !== 'GET') throw new Error('Invalid method for getSites')
        return await getLists()
      case 'getListsByUserId':
        if (method !== 'GET') throw new Error('Invalid method for getSites')
        return await getListsByUserId(params.userId)
      case 'getList':
        if (method !== 'GET') throw new Error('Invalid method for getSites')
        return await getListById(parseInt(params.id))
      case 'postSite':
        if (method !== 'POST') throw new Error('Invalid method for createLink')
        return await insertSite(data as CreateLinkRequest)
      case 'updateSite':
        if (method !== 'PUT') throw new Error('Invalid method for updateSite')
        return await updateSite(params.id, data as CreateLinkRequest)
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}
