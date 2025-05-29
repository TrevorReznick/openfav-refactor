import { supabase } from '@/providers/supabaseAuth';
import type {
    CreateLinkRequest,
    MainTableData,
    SubMainTableData,
    CategoriesTagsData,
    ApiResponse
} from '@/types/api';
//import { get } from '../../main';

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


