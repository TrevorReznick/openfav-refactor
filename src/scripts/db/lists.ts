import { supabaseQuery, supabaseInsert, supabaseUpdate, supabaseDelete } from '~/scripts/supabase'
import { supabase } from '@/providers/supabaseAuth'

export const getLists = async () => {
    return await supabaseQuery('lists_users', {
        select: '*'
    })
}

export async function getListsByUserId(userId) {
    return await supabaseQuery('lists_users', {        
        select: '*',
        filter: (query) => query.eq('id_user', userId)
    })
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