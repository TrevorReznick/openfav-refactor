import type { ApiResponse } from '@/types/api'

const api_url = import.meta.env.PUBLIC_API_URL || 'http://localhost:4321'

export async function makeRequest<T>(
    endpoint: string,
    data?: Record<string, any>,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
): Promise<ApiResponse<T>> {
    try {
        let url = `${api_url}/${endpoint}`;
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Per gestire i cookie di autenticazione
            body: method !== 'GET' ? JSON.stringify(data) : undefined,
        };

        if (method === 'GET' && data) {
            const params = new URLSearchParams();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, options);
        const result = await response.json();

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
