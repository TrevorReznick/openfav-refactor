import { supabase } from '@/providers/supabaseAuth';
import type {
  //CreateLinkRequest,
  MainTableData,
  SubMainTableData,
  CategoriesTagsData,
  ApiResponse
} from '@/types/api';
//import { get } from '../../main';

/**
 * Crea un nuovo link con tutte le relative associazioni
 */
/*
export async function createLinkWithAssociations(linkData: CreateLinkRequest): Promise<ApiResponse<{ id: string | number }>> {
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

    const sourceId = mainData.id;

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
        AI_Summary: linkData.AI_Summary
      };

      const { error: categoriesError } = await supabase
        .from('categories_tags')
        .insert(categoriesTagsData);

      if (categoriesError) {
        throw categoriesError;
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
    };
  }
}
*

/**
 * Ottiene i link con tutte le relative associazioni
 */
export async function getSites(): Promise<ApiResponse<MainTableData[]>> {
  try {
    const { data, error } = await supabase
      .from('main_table')
      .select(`
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
        ),
        sub_main_table (
          user_id,
          accessible,
          domain_exists,
          html_content_exists,
          is_public,
          secure, 
          status_code,
          valid_url,
          type,
          AI
        )
      `);

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

export async function getSitesByUserId(userId: string): Promise<ApiResponse<MainTableData[]>> {
  try {
    const { data, error } = await supabase
      .from('main_table')
      .select(`
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
        ),
        sub_main_table (
          user_id,
          accessible,
          domain_exists,
          html_content_exists,
          is_public,
          secure,
          status_code,
          valid_url,
          type,
          AI
        )
      `)
      .eq('sub_main_table.user_id', userId); // Filtra per user_id

    if (error) {
      throw error;
    }

    // Mappatura dei dati per conformarsi alle interfacce
    const formattedData: MainTableData[] = data.map((item) => ({
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

    return {
      data: formattedData,
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

export default {
  //createLinkWithAssociations,
  getSites
}
