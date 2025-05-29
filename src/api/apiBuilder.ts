import type { ApiResponse } from '@/types/api'

const api_url = import.meta.env.PUBLIC_API_URL || 'http://localhost:4321'

export async function makeRequest<T>(
    endpoint: string,
    data?: Record<string, any>,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
): Promise<ApiResponse<T>> {
    try {
        // Ensure there's no double slash between api_url and endpoint
        const baseUrl = api_url.endsWith('/') ? api_url.slice(0, -1) : api_url;
        let url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
        
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: method !== 'GET' ? JSON.stringify(data) : undefined,
        };

        if (method === 'GET' && data) {
            const params = new URLSearchParams();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
            url += `${url.includes('?') ? '&' : '?'}${params.toString()}`;
        }

        console.log('Invio richiesta a:', url);
        const response = await fetch(url, options);
        const result = await response.json();
        
        // Log della risposta
        console.log('=== Risposta API ===');
        console.log('URL:', url);
        console.log('Stato:', response.status, response.statusText);
        console.log('Risposta:', result);
        console.log('===================');

        if (!response.ok) {
            return {
                error: result.error || 'Server error',
                status: response.status
            };
        }

        return {
            data: result,
            status: response.status
        };

    } catch (error) {
        console.error('API request error:', error);
        return {
            error: (error as Error).message,
            status: 500
        };
    }
}
