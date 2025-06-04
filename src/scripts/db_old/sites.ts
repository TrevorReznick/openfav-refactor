import { supabase } from '@/providers/supabaseAuth'
import { QUERY_MAIN_TABLE } from '@/constants'
import { supabaseUpdate, supabaseQuery, supabaseInsert, supabaseDelete } from '~/scripts/db_old/supabase'
import type {
  CreateLinkRequest,
  MainTableData,
  SubMainTableData,
  CategoriesTagsData,
  ApiResponse
} from '@/types/api';

/**
 * Crea la funzione SQL necessaria per l'aggiornamento atomico
 */
export async function createUpdateSiteFunction() {
  const createFunctionSQL = `
  CREATE OR REPLACE FUNCTION update_site_with_associations(
      p_id BIGINT,
      p_description TEXT,
      p_icon TEXT,
      p_image TEXT,
      p_logo TEXT,
      p_name TEXT,
      p_title TEXT,
      p_url TEXT,
      p_user_id UUID,
      p_accessible BOOLEAN,
      p_domain_exists BOOLEAN,
      p_html_content_exists BOOLEAN,
      p_is_public BOOLEAN,
      p_secure BOOLEAN,
      p_status_code INTEGER,
      p_type TEXT,
      p_valid_url BOOLEAN,
      p_ai BOOLEAN,
      p_id_area INTEGER,
      p_id_cat INTEGER,
      p_tag_3 INTEGER,
      p_tag_4 INTEGER,
      p_tag_5 INTEGER,
      p_id_provider INTEGER,
      p_ratings JSONB,
      p_ai_think TEXT,
      p_ai_summary TEXT
  ) 
  RETURNS JSONB
  LANGUAGE plpgsql
  AS $$
  DECLARE
      result JSONB;
  BEGIN
      -- Start a transaction
      BEGIN
          -- Update main_table
          UPDATE main_table
          SET 
              description = COALESCE(p_description, description),
              icon = COALESCE(p_icon, icon),
              image = COALESCE(p_image, image),
              logo = COALESCE(p_logo, logo),
              name = COALESCE(p_name, name),
              title = COALESCE(p_title, title),
              url = COALESCE(p_url, url),
              updated_at = NOW()
          WHERE id = p_id
          RETURNING to_jsonb(ROW_TO_JSON(main_table.*)) INTO result;
          -- Update sub_main_table
          UPDATE sub_main_table
          SET
              user_id = COALESCE(p_user_id, user_id),
              accessible = COALESCE(p_accessible, accessible),
              domain_exists = COALESCE(p_domain_exists, domain_exists),
              html_content_exists = COALESCE(p_html_content_exists, html_content_exists),
              is_public = COALESCE(p_is_public, is_public),
              secure = COALESCE(p_secure, secure),
              status_code = COALESCE(p_status_code, status_code),
              type = COALESCE(p_type, type),
              valid_url = COALESCE(p_valid_url, valid_url),
              AI = COALESCE(p_ai, AI),
              updated_at = NOW()
          WHERE id_src = p_id;
          -- Update or insert into categories_tags
          IF EXISTS (SELECT 1 FROM categories_tags WHERE id_src = p_id) THEN
              UPDATE categories_tags
              SET
                  id_area = COALESCE(p_id_area, id_area),
                  id_cat = COALESCE(p_id_cat, id_cat),
                  tag_3 = COALESCE(p_tag_3, tag_3),
                  tag_4 = COALESCE(p_tag_4, tag_4),
                  tag_5 = COALESCE(p_tag_5, tag_5),
                  id_provider = COALESCE(p_id_provider, id_provider),
                  ratings = COALESCE(p_ratings, ratings),
                  AI_think = COALESCE(p_ai_think, AI_think),
                  AI_summary = COALESCE(p_ai_summary, AI_summary),
                  updated_at = NOW()
              WHERE id_src = p_id;
          ELSE
              INSERT INTO categories_tags (
                  id_src, id_area, id_cat, tag_3, tag_4, tag_5, 
                  id_provider, ratings, AI_think, AI_summary
              ) VALUES (
                  p_id, p_id_area, p_id_cat, p_tag_3, p_tag_4, p_tag_5,
                  p_id_provider, p_ratings, p_ai_think, p_ai_summary
              );
          END IF;
          -- If we got here, commit the transaction
          RETURN jsonb_build_object('success', true, 'data', result);
      EXCEPTION WHEN OTHERS THEN
          -- Rollback the transaction on error
          RAISE EXCEPTION 'Error updating site: %%', SQLERRM;
      END;
  END;
  $$;
  `;
  const { data, error } = await supabase.rpc('pg_temp.execute_sql', { sql: createFunctionSQL });
  if (error) {
    console.error('Error creating update site function:', error);
    // Try to create the execute_sql function if it doesn't exist
    if (error.message.includes('function pg_temp.execute_sql(unknown) does not exist')) {
      await createExecuteSQLFunction();
      // Retry creating our function
      return createUpdateSiteFunction();
    }
    throw error;
  }
  return data;
}

/**
 * Helper function to create the execute_sql function if it doesn't exist
 */
export async function createExecuteSQLFunction() {
  const createExecuteSQL = `
  CREATE OR REPLACE FUNCTION pg_temp.execute_sql(sql text) 
  RETURNS jsonb
  LANGUAGE plpgsql
  AS $$
  BEGIN
      EXECUTE sql;
      RETURN jsonb_build_object('success', true);
  EXCEPTION WHEN OTHERS THEN
      RETURN jsonb_build_object(
          'success', false,
          'error', SQLERRM,
          'sqlstate', SQLSTATE
      );
  END;
  $$;
  `;
  const { error } = await supabase.rpc('pg_temp.execute_sql', { sql: createExecuteSQL });
  if (error) {
    console.error('Error creating execute_sql function:', error);
    throw error;
  }
}

export async function deleteSite(id: string | number): Promise<ApiResponse<null>> {
  try {
    if (!id) {
      throw new Error('ID parameter is required but was undefined');
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error(`Invalid ID format: ${id}`);
    }

    // Eseguiamo l'eliminazione del record tramite Supabase
    const { error } = await supabase
      .from('main_table')
      .delete()
      .eq('id', numericId);

    if (error) {
      console.error('Error deleting site:', error);
      return {
        error: error.message || 'Internal server error',
        status: 500,
      };
    }

    // Restituiamo una risposta di successo
    return {
      data: null,
      status: 200,
    };
  } catch (error: any) {
    console.error('Error in deleteSite:', error);
    return {
      error: error.message || 'Internal server error',
      status: 500,
    };
  }
}

export async function deleteSitePattern(id: any) {
  console.log('deleteSite called with id:', id) //FIXME
  if (!id) {
    throw new Error('ID parameter is required but was undefined')
  }
  const numericId = Number(id)
  console.log('Converted numericId:', numericId) // Debug log
  if (isNaN(numericId)) {
    throw new Error(`Invalid ID format: ${id}`)
  }
  const tableName = 'main_table'
  console.log('siamo arrivati fino a qui')
  const result = await supabaseDelete(tableName, (query) => {
    console.log('Building query with ID:', numericId) // Debug log
    return query.eq('id', numericId)
  })
  return result.data
}

export function dataHelper(data: any[]): MainTableData[] {
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

/**
 * Crea un nuovo link con tutte le relative associazioni
 */
export async function insertSite(linkData: CreateLinkRequest): Promise<ApiResponse<{ id: string | number }>> {
  try {
    // 1. Crea il record principale
    const mainTableData: MainTableData = {
      description: linkData.description,
      icon: linkData.icon,
      image: linkData.image,
      logo: linkData.logo,
      name: linkData.name,
      title: linkData.title,
      url: linkData.url
    };
    const { data: mainData, error: mainError } = await supabase
      .from('main_table')
      .insert(mainTableData)
      .select('id')
      .single();
    if (mainError || !mainData) {
      throw mainError || new Error('Failed to create main table record');
    }
    const sourceId = mainData.id
    // 2. Crea il record nella sub_main_table
    const subMainTableData: SubMainTableData = {
      id_src: sourceId,
      user_id: linkData.user_id,
      accessible: linkData.accessible ?? false,
      domain_exists: linkData.domain_exists ?? false,
      html_content_exists: linkData.html_content_exists ?? false,
      is_public: linkData.is_public ?? true,
      secure: linkData.secure ?? false,
      status_code: linkData.status_code,
      type: linkData.type,
      valid_url: linkData.valid_url ?? true,
      AI: linkData.AI ?? false
    };
    const { error: subMainError } = await supabase
      .from('sub_main_table')
      .insert(subMainTableData);
    if (subMainError) {
      throw subMainError;
    }
    // 3. Crea il record in categories_tags se ci sono dati
    if (linkData.id_area !== undefined || linkData.id_cat !== undefined) {
      const categoriesTagsData: CategoriesTagsData = {
        id_src: sourceId,
        id_area: linkData.id_area ?? -1,
        id_cat: linkData.id_cat ?? -1,
        tag_3: linkData.tag_3 ?? -1,
        tag_4: linkData.tag_4 ?? -1,
        tag_5: linkData.tag_5 ?? -1,
        id_provider: linkData.id_provider,
        ratings: linkData.ratings,
        AI_think: linkData.AI_think,
        AI_summary: linkData.AI_summary
      };
      console.log('Inserting into categories_tags:', categoriesTagsData)
      const { error: categoriesError } = await supabase
        .from('categories_tags')
        .insert(categoriesTagsData)
      if (categoriesError) {
        throw categoriesError
      }
    }
    return {
      data: { id: sourceId },
      status: 200
    };
  } catch (error: any) {
    console.error('Error creating link with associations:', error);
    return {
      error: error.message || 'Internal server error',
      status: 500
    }
  }
}

/**
 * Aggiorna un sito esistente con tutte le relative associazioni
 */
export async function updateSite(
  sourceId: string | number,
  linkData: CreateLinkRequest
): Promise<ApiResponse<{ id: string | number }>> {
  if (sourceId === undefined || sourceId === null || sourceId === '') {
    console.error('❌ sourceId is invalid:', sourceId);
    return {
      error: 'Invalid source ID provided',
      status: 400
    };
  }
  console.log('✅ sourceId is valid:', sourceId, typeof sourceId);
  try {
    // 1. Aggiorna il record principale
    const mainTableData: Partial<MainTableData> = {
      description: linkData.description,
      icon: linkData.icon,
      image: linkData.image,
      logo: linkData.logo,
      name: linkData.name,
      title: linkData.title,
      url: linkData.url
    };
    const { error: mainError } = await supabase
      .from('main_table')
      .update(mainTableData)
      .eq('id', sourceId);
    if (mainError) {
      throw mainError;
    }
    // 2. Aggiorna il record nella sub_main_table
    const subMainTableData: Partial<SubMainTableData> = {
      user_id: linkData.user_id,
      accessible: linkData.accessible,
      domain_exists: linkData.domain_exists,
      html_content_exists: linkData.html_content_exists,
      is_public: linkData.is_public,
      secure: linkData.secure,
      status_code: linkData.status_code,
      type: linkData.type,
      valid_url: linkData.valid_url,
      AI: linkData.AI
    };
    const { error: subMainError } = await supabase
      .from('sub_main_table')
      .update(subMainTableData)
      .eq('id_src', sourceId);
    if (subMainError) {
      throw subMainError;
    }
    // 3. Aggiorna o crea il record in categories_tags
    const categoriesTagsData: Partial<CategoriesTagsData> = {
      id_area: linkData.id_area,
      id_cat: linkData.id_cat,
      tag_3: linkData.tag_3,
      tag_4: linkData.tag_4,
      tag_5: linkData.tag_5,
      id_provider: linkData.id_provider,
      ratings: linkData.ratings,
      AI_think: linkData.AI_think,
      AI_summary: linkData.AI_summary
    };
    // Controlla se esiste già un record per questo id_src
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories_tags')
      .select('id_src')
      .eq('id_src', sourceId)
      .single();
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw fetchError;
    }
    if (existingCategory) {
      // Aggiorna il record esistente
      const { error: updateError } = await supabase
        .from('categories_tags')
        .update(categoriesTagsData)
        .eq('id_src', sourceId);
      if (updateError) throw updateError;
    } else if (linkData.id_area !== undefined || linkData.id_cat !== undefined) {
      // Crea un nuovo record solo se ci sono dati da inserire
      const { error: insertError } = await supabase
        .from('categories_tags')
        .insert([{ ...categoriesTagsData, id_src: sourceId }]);
      if (insertError) throw insertError;
    }
    return {
      data: { id: sourceId },
      status: 200
    };
  } catch (error: any) {
    console.error('Error updating site with associations:', error);
    return {
      error: error.message || 'Internal server error',
      status: 500
    };
  }
}

export function subDataHelper(data: any[]): MainTableData[] {
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

export default {
  createUpdateSiteFunction,
  createExecuteSQLFunction,
  deleteSite,
  dataHelper,
  getSites,
  getSiteById,
  getSitesByUserId,
  getSitesByUserIdNew,
  getSitesByUserIdOnlyValidFields,
  insertSite,
  updateSite,
  subDataHelper
}