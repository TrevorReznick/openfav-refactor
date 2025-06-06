import { supabaseQuery, supabaseInsert, supabaseUpdate } from '~/scripts/supabase'
import { EVENT_LOGS } from '@/constants'

export const getEvents = async () => {
    return await supabaseQuery('event_log', {
        select: EVENT_LOGS
    })
}

const insertEvent = async (data: any) => {
    const tableName = 'event_log'
    const result = await supabaseInsert(tableName, data)
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.data
}

const updateEvent = async (data: any, id: string) => {
    const tableName = 'event_log'
    const result = await supabaseUpdate(tableName, data, (query) => query.eq('id', parseInt(id)))
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.data
}