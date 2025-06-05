import { supabaseQuery, supabaseInsert } from "~/scripts/supabase"

const insertEvent = async (data: any) => {
    const tableName = 'event_log'
    const result = await supabaseInsert(tableName, data)
    if (!result.success) {
        throw new Error(result.error)
    }
    return result.data
}