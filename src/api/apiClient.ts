import { makeRequest } from '~/api/apiBuilder'
import type {ApiResponse} from '~/types/api'

const api_endpoint: string = 'main/doQueries'

export const sendApiRequest = async (fetchFunc) => {
    try {
        const response = await fetchFunc();
        if (response.success) {
            return response.data;
        } else {
            throw new Error("Errore nella risposta dell'API")
        }
    } catch (error) {
        throw error;
    }
};

export const fetchElements = (type: string, user_id?: string | {}) => 
    makeRequest(api_endpoint, type, {user_id})

export const fetchElement = (type: string, id?: number) => {

    makeRequest(api_endpoint, type, { id })

}

/* @@ -- POST methods -- @@ */

export const createPostEvent = async (data) => {
    return makeRequest(api_endpoint, 'insertEvent', {}, 'POST', data)
}

/* @@ -- PUT methods -- @@ */

export const createUpdateEvent = async (data: any) => {
    return makeRequest(api_endpoint, 'updateEvent', {id: data.id }, 'PUT', data)
}

/* @@ -- DEL methods -- @@ */

export const deleteEvent = (id: number) => 
    makeRequest(api_endpoint, 'deleteEvent', { id }, 'DELETE', {})

export const deleteSite = (id: number) => 
    makeRequest(api_endpoint, 'deleteSite', { id }, 'DELETE', {})

/* @@ -- GET methods -- @@ */

export const fetchElementsV0 = async <T>(
    type: string,
    params?: Record<string, any>
): Promise<ApiResponse<T>> => {
    try {
        // Chiamata a makeRequest con endpoint fisso e metodo GET
        return await makeRequest<T>(api_endpoint, type, params, 'GET');
    } catch (error) {
        console.error('Error in fetchElements:', error);
        throw error; // Rilancia l'errore per permettere al chiamante di gestirlo
    }
}