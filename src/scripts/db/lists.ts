import { supabaseQuery, supabaseInsert, supabaseUpdate, supabaseDelete } from '~/scripts/supabase'
import { supabase } from '@/providers/supabaseAuth'
import type { UserList, CreateListData, UpdateListData } from '@/types/api'

export const getLists = async () => {
    return await supabaseQuery('lists_users', {
        select: '*'
    })
}

export async function getListsByUserId(userId) {
    console.log('controllo parametro', userId)
    return await supabaseQuery('lists_users', {
        select: '*',
        filter: (query) => query.eq('id_user', userId)
    })
}

export async function getListById(id) {
    return await supabaseQuery('lists_users', {
        select: '*',
        filter: (query) => query.eq('id', id)
    })
}

export async function createList(data: UserList) {
    return await supabaseInsert('lists_users', data)
}

export async function updateList(id: number, data: UserList) {
    const tableName = 'lists_users'
    const result = await supabaseUpdate(tableName, data, (query) => query.eq('id', id))
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.data
}
export async function deleteList(id: number) {
    return await supabaseDelete('lists_users', (query) => query.eq('id', id))
}

/*
export async function getListsOld() {
    try {
        const { data, error } = await supabase
            .from('lists_users')
            .select(`*`)
        if (error) {
            throw error;
        }

        return {
            data,
            status: 200
        };
    } catch (error: any) {
        console.error('Error fetching links with associations:', error);
        return {
            error: error.message || 'Internal server error',
            status: 500
        };
    }
}

export async function getListsByUserId(userId) {
    try {
        const { data, error } = await supabase
            .from('lists_users')
            .select(`*`)
            .eq('id_user', userId)
        if (error) {
            throw error;
        }

        return {
            data,
            status: 200
        };
    } catch (error: any) {
        console.error('Error fetching links with associations:', error);
        return {
            error: error.message || 'Internal server error',
            status: 500
        };
    }
}

export async function getListById(id: number) {
    try {
        const { data, error } = await supabase
            .from('lists_users')
            .select(`*`)
            .eq('id', id)
        if (error) {
            throw error;
        }

        return {
            data,
            status: 200
        };
    } catch (error: any) {
        console.error('Error fetching links with associations:', error);
        return {
            error: error.message || 'Internal server error',
            status: 500
        };
    }
}
*/