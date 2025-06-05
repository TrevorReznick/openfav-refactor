// src/pages/api/doQueriesNew.ts

import type { APIRoute } from 'astro'
import { makeHandleRequest } from '@/scripts/http/handleRequest'
import  * as sites  from '@/scripts/db/sites'


// --- Definizione della callback API ---
const apiRouter = async (
    method: string,
    type: string,
    params: Record<string, string>,
    request?: Request
): Promise<any> => {
    const data = request ? await request.json().catch(() => ({})) : {}

    switch (type) {
        /* ---- GET /sites ---- */
        case "getSites": {
          if (method !== "GET") {
            throw new Error("Invalid method for getSites");
          }
          // usa await se la funzione è async e vuoi gestire qui gli errori
          return await sites.getSites();
        }
      
        /* ---- GET /sites/:id ---- */
        case "getSite": {
          if (method !== "GET") {
            throw new Error("Invalid method for getSiteById");
          }
      
          const { id } = params;
          if (!id) {
            throw new Error("ID is required for getSiteById");
          }
      
          return await sites.getSiteById(id);
        }
      
        /* ---- altri tipi non gestiti ---- */
        default:
          throw new Error(`Unknown operation type: ${type}`);
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