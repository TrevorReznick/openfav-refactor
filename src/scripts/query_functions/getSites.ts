import { supabase } from '@/providers/supabaseAuth'
import { QUERY_MAIN_TABLE } from '@/constants'
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

function subDataHelper(data: any[]): MainTableData[] {
  return data.map((item) => {
    const mainTableData = item.main_table; // Estrai i dati annidati di main_table
    return {
      id: mainTableData.id,
      description: mainTableData.description,
      icon: mainTableData.icon,
      image: mainTableData.image,
      logo: mainTableData.logo,
      name: mainTableData.name,
      title: mainTableData.title,
      url: mainTableData.url,
      categories_tags: mainTableData.categories_tags, // Questo è già un array annidato
      sub_main_table: {
        id_src: item.id_src, // ID della tabella sub_main_table
        user_id: item.user_id, // ID utente
        accessible: item.accessible, // Campo booleano
        domain_exists: item.domain_exists, // Campo booleano
        html_content_exists: item.html_content_exists, // Campo booleano
        is_public: item.is_public, // Campo booleano
        secure: item.secure, // Campo booleano
        status_code: item.status_code, // Campo opzionale
        type: item.type, // Campo opzionale
        valid_url: item.valid_url, // Campo booleano
        AI: item.AI, // Campo booleano opzionale
      },
    };
  });
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

export async function getSitesByUserIdNew(userId) {
  try {
    const { data, error } = await supabase
      .from('sub_main_table')
      .select(`
        *
      `)
      //.filter('user_id', 'eq', userId); // Filtra per user_id
      .eq('user_id', userId); // Filtra per id


    if (error) {
      throw error;
    }

    return {
      data: data,
      status: 200,
    };
  } catch (error) {
    console.error('Error fetching unique sub_main_table by user ID:', error);
    return {
      error: error.message || 'Internal server error',
      status: 500,
    };
  }
}

export async function getSitesByUserId(userId) {
  try {
    const { data, error } = await supabase
      .from('sub_main_table')
      .select(`
        *,
        main_table (
          id,
          description,
          icon,
          image,
          logo,
          name,
          title,
          url,
          categories_tags (
            id_area,
            id_cat,
            tag_3,
            tag_4,
            tag_5,
            id_provider,
            ratings,
            AI_think,
            AI_summary
          )
        )
      `)
      .filter('user_id', 'eq', userId); // Filtra per user_id

    if (error) {
      throw error;
    }

    const mapData = subDataHelper(data)

    return {
      data: mapData,
      status: 200,
    };
  } catch (error) {
    console.error('Error fetching sub_main_table by user ID:', error);
    return {
      error: error.message || 'Internal server error',
      status: 500,
    };
  }
}

export async function getSitesByUserIdOnlyValidFields(userId: string): Promise<ApiResponse<MainTableData[]>> {
  try {
    // Prima otteniamo gli ID dei main_table che hanno sub_main_table con il user_id specificato
    const { data: mainTableIds, error: idError } = await supabase
      .from('sub_main_table')
      .select('id_src')
      .filter('user_id', 'eq', userId);

    if (idError) {
      throw idError;
    }

    // Se non ci sono ID, restituiamo un array vuoto
    if (mainTableIds.length === 0) {
      return {
        data: [],
        status: 200,
      };
    }

    // Ora otteniamo i dati da main_table utilizzando gli ID ottenuti
    const { data, error } = await supabase
      .from('main_table')
      .select(QUERY_MAIN_TABLE) // Utilizza la costante QUERY_MAIN_TABLE
      .in('id', mainTableIds.map(item => item.id_src))
      .not('description', 'is', null) // Escludi record con description null
      .not('name', 'is', null) // Escludi record con name null
      .not('url', 'is', null); // Escludi record con url null

    if (error) {
      throw error;
    }

    return {
      data: data,
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
