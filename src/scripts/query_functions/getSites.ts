import { supabase } from '@/providers/supabaseAuth'
import { QUERY_MAIN_TABLE } from '../../constants'
import type {
  //CreateLinkRequest,
  MainTableData,
  SubMainTableData,
  CategoriesTagsData,
  ApiResponse
} from '@/types/api';
//import { get } from '../../main';

function dataHelper(data: any[]): MainTableData[] {
  return data.map((item) => ({
    id: item.id,
    description: item.description,
    icon: item.icon,
    image: item.image,
    logo: item.logo,
    name: item.name,
    title: item.title,
    url: item.url,
    categories_tags: item.categories_tags,
    sub_main_table: item.sub_main_table,
  }));
}


/**
 * Ottiene i link con tutte le relative associazioni
 */
export async function getSites(): Promise<ApiResponse<MainTableData[]>> {
  try {
    const { data, error } = await supabase
      .from('main_table')
      .select(QUERY_MAIN_TABLE)
    if (error) {
      throw error;
    }

    const mapData = dataHelper(data)

    return {
      data: mapData,
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

export async function getSitesByUserId(userId: string): Promise<ApiResponse<MainTableData[]>> {
  try {
    const { data, error } = await supabase
      .from('main_table')
      .select(QUERY_MAIN_TABLE)
      .eq('sub_main_table.user_id', userId); // Filtra per user_id

    if (error) {
      throw error;
    }
    const mapData = dataHelper(data)

    return {
      data: mapData,
      status: 200,
    };
  } catch (error: any) {
    console.error('Error fetching sites by user ID:', error);
    return {
      error: error.message || 'Internal server error',
      status: 500,
    };
  }
}

export async function getSiteById(id: string): Promise<ApiResponse<MainTableData[]>> {
  try {
    const { data, error } = await supabase
      .from('main_table')
      .select(QUERY_MAIN_TABLE)
      .eq('id', id); // Filtra per id

    if (error) {
      throw error;
    }

    const mapData = dataHelper(data)

    return {
      data: mapData,
      status: 200,
    }
  } catch (error: any) {
    console.error('Error fetching sites by user ID:', error);
    return {
      error: error.message || 'Internal server error',
      status: 500,
    };
  }
}

export default {
  getSites,
  getSiteById
}
