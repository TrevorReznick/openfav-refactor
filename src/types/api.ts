/**
 * TIPI PRINCIPALI PER LE OPERAZIONI DI BASE
 */

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status?: number;
}

/**
 * TIPI PER I LINK E LE RISORSE
 */
/* imported from old types */
export interface Link {
    id: string;
    title: string;
    url: string;
    description: string | null;
    created_at: string;
}

export interface Collection {
    id: string;
    name: string;
    description: string | null;
    is_public: boolean;
}

/**
 * TIPI PER I LINK E LE RISORSE
 */
/* imported from old types */

export interface Link {
    id: string;
    title: string;
    url: string;
    description: string | null;
    created_at: string;
}

export interface Collection {
    id: string;
    name: string;
    description: string | null;
    is_public: boolean;
}

export interface CollectionFormData {
    name: string;
    description: string;
    is_public: boolean;
}


/**
 * TIPI PER LE LISTE
*/

export interface CreateListData {
    name: string;
    description: string;
    public: boolean;
}

export interface LinkFormData {
    title: string;
    url: string;
    description: string;
    context_id: string;
    resource_id: string;
    function_id: string;
}

export interface UserList {
    id: number;
    name: string;
    description: string | null;
    public: boolean;
    created_at: string;
    modified_at: string;
}

export interface UpdateListData {
    name?: string;
    description?: string;
    public?: boolean;
}