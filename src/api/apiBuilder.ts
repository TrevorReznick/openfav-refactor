const api_prod = import.meta.env.PUBLIC_PROD_API_URL
const api_dev = import.meta.env.PUBLIC_DEV_API_URL
const api_url = import.meta.env.MODE === 'production' ? api_prod : api_dev
import type {ApiResponse} from '~/types/api'

export async function makeRequest<T = unknown>(
    endpoint: string,
    type: string,
    params?: Record<string, any>,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, any>
): Promise<ApiResponse<T>> {
    console.log('hello from builder')
    try {
        console.log('tring operations...')
        const urlParams = new URLSearchParams(params).toString();
        const url = `${api_url}${endpoint}?type=${type}&${urlParams}`
        console.log('debugging url', url)
        const options: RequestInit = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: method !== 'GET' ? JSON.stringify(body) : undefined,
        }

        const response = await fetch(url, options)

        //console.log('debugging response', response)
        const result = await response.json()
        if (!response.ok) {
            //throw new Error('Server responded but give an errror')
            console.log('Server responded but give an error', result)
        }
        
        return { success: true, data: result }

    } catch (error) {
        
        console.error(`Client error received:`, error);
        return { success: false, error: (error as Error).message }
    }
}