import { supabaseQuery, supabaseInsert } from "~/scripts/supabase";
import { SITES_REL_QUERY, SITES_REL_QUERY_WITH_USER, QUERY_SITES_CATEGORIES } from '@/constants'
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

export const getSitesByUserId = async (userId: string) => {
  return await supabaseQuery('main_table', {
    select: SITES_REL_QUERY_WITH_USER,
    filter: (query) => query.eq('user_id', userId)
  })
}

export const getSitesCategories = async (/*userId: string*/) => {
  return await supabaseQuery('categories_tags', {
    select: QUERY_SITES_CATEGORIES,
    //filter: (query) => query.eq('user_id', userId),
    order: {
      column: 'id',
      ascending: true
    }
  })
}

export const insertSite = async (
  linkData: CreateLinkRequest
): Promise<ApiResponse<{ id: string | number }>> => {
  try {
    // --- 1. Inserisci nel main_table ---
    const mainTableData: MainTableData = {
      description: linkData.description ?? undefined,
      icon: linkData.icon ?? undefined,
      image: linkData.image ?? undefined,
      logo: linkData.logo ?? undefined,
      name: linkData.name,
      title: linkData.title ?? undefined,
      url: linkData.url
    };

    const mainResult = await supabaseInsert<MainTableData>('main_table', mainTableData);

    if (!mainResult.success || !mainResult.data || mainResult.data.length === 0) {
      throw new Error('Failed to insert into main_table');
    }

    const insertedMainRecord = mainResult.data[0];
    let sourceId = insertedMainRecord.id;
    if (sourceId === undefined) {
      throw new Error('Inserted main_table record does not have a valid id');
    }
    // Convert bigint to string to satisfy type requirements
    if (typeof sourceId === 'bigint') {
      sourceId = sourceId.toString();
    }

    // --- 2. Inserisci nel sub_main_table ---
    const subMainTableData: SubMainTableData = {
      id_src: sourceId,
      user_id: linkData.user_id,
      accessible: linkData.accessible ?? false,
      domain_exists: linkData.domain_exists ?? false,
      html_content_exists: linkData.html_content_exists ?? false,
      is_public: linkData.is_public ?? true,
      secure: linkData.secure ?? true,
      status_code: linkData.status_code ?? undefined,
      valid_url: linkData.valid_url ?? true,
      type: linkData.type ?? '',
      AI: linkData.AI ?? false
    };

    const subMainResult = await supabaseInsert<SubMainTableData>('sub_main_table', subMainTableData);

    if (!subMainResult.success) {
      throw new Error('Failed to insert into sub_main_table');
    }

    // --- 3. Se ci sono dati, inserisci in categories_tags ---
    if (
      linkData.id_area !== undefined ||
      linkData.id_cat !== undefined ||
      linkData.id_provider !== undefined
    ) {
      const categoriesTagsData: CategoriesTagsData = {
        id_src: sourceId,
        id_area: linkData.id_area ?? -1,
        id_cat: linkData.id_cat ?? -1,
        tag_3: linkData.tag_3 ?? -1,
        tag_4: linkData.tag_4 ?? -1,
        tag_5: linkData.tag_5 ?? -1,
        id_provider: linkData.id_provider ?? -1,
        ratings: linkData.ratings ?? -1,
        AI_think: linkData.AI_think ?? undefined,
        AI_summary: linkData.AI_summary ?? undefined
      };

      const categoriesResult = await supabaseInsert<CategoriesTagsData>(
        'categories_tags',
        categoriesTagsData
      );

      if (!categoriesResult.success) {
        throw new Error('Failed to insert into categories_tags');
      }
    }

    // --- 4. Restituisci l'ID del record creato ---
    return {
      data: { id: sourceId },
      status: 200
    };
  } catch (error: any) {
    console.error('Error creating site with associations:', error);
    return {
      error: error.message || 'Internal server error',
      status: 500
    };
  }
};