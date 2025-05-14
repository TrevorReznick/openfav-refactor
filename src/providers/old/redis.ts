const redis_session_api_url = import.meta.env.PUBLIC_REDIS_API_URL;

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: any;
}

/**
 * Effettua una richiesta POST al Redis Session API
 * @param endpoint - Endpoint specifico (es: "/sessions")
 * @param payload - Oggetto payload da inviare nel corpo della richiesta
 * @returns Promessa con ApiResponse
 */
export async function postRequest<T>(
    payload: Record<string, any>
): Promise<ApiResponse<T>> {
    try {
        console.log('fetching redis request')
        const url = redis_session_api_url
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            console.log('error response')
            return {
                success: false,
                error: `HTTP Error: ${response.status} - ${response.statusText}`,
            };
        }

        const rawResponse = await response.text()

        // Try to parse as JSON first
        try {
            const data = JSON.parse(rawResponse)
            console.log('success set redis tokens')
            return {
                success: true,
                data,
            }
        } catch {
            // If parsing fails, treat as plain text
            console.log('success set redis tokens')
            return {
                success: true,
                data: { message: rawResponse } as T,
            }
        }
    } catch (error) {
        console.log('request error')
        return {
            success: false,
            error,
        }
    }
}



/*
const updatedEventData = {
    id: 235,
    id_event_type: 3,
    id_event_family: 2,
}

export const createPostEvent = async (data) => {
    return makeRequest(api_endpoint, 'insertEvent', {}, 'POST', data)
}
*/