import { supabase } from '@/providers/supabaseAuth'

export async function getLists() {
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