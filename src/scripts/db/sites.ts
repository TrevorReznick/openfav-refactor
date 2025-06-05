import { supabaseQuery } from "~/scripts/db_old/supabase";
import { SITES_REL_QUERY } from '@/constants'
import type {
  CreateLinkRequest,
  MainTableData,
  SubMainTableData,
  CategoriesTagsData,
  ApiResponse
} from '@/types/api';

export const getSites = async () => {
  return await supabaseQuery('main_table', {
    select: SITES_REL_QUERY
  })
}

export const getSiteById = async (id: string | number) => {
  return await supabaseQuery('main_table', {
    select: SITES_REL_QUERY,
    filter: (query) => query.eq('id', id)
  })
}