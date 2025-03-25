import { atom, map } from 'nanostores'
import { supabase } from '@/providers/supabaseAuth'

// Definizione delle interfacce
export interface Link {
  id: string
  title: string
  url: string
  description: string | null
  created_at: string
}

export interface Collection {
  id: string
  name: string
  description: string | null
  is_public: boolean
}

export interface ResourceType {
  resource_id: number
  name: string
  description: string
}

export interface FunctionType {
  function_id: number
  name: string
  description: string
}

export interface ContextType {
  context_id: number
  name: string
  description: string
}

// Store per i links e le collezioni
export const links = atom<Link[]>([])
export const collections = atom<Collection[]>([])

// Store per i tipi di classificazione
export const resourceTypes = atom<ResourceType[]>([])
export const functionTypes = atom<FunctionType[]>([])
export const contextTypes = atom<ContextType[]>([])

// Store per lo stato di caricamento
export const loading = atom(true)

// Actions
export async function fetchUserData() {
  try {
    // Fetch recent links
    const { data: linksData, error: linksError } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (linksError) throw linksError

    // Fetch collections
    const { data: collectionsData, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (collectionsError) throw collectionsError

    links.set(linksData || [])
    collections.set(collectionsData || [])
  } catch (error: any) {
    console.error('Error fetching user data:', error)
  } finally {
    loading.set(false)
  }
}

export async function fetchClassificationTypes() {
  try {
    // Fetch contexts (environments)
    const { data: contextData } = await supabase
      .from('context_types')
      .select('*')

    // Fetch resource types
    const { data: resourceData } = await supabase
      .from('resource_types')
      .select('*')

    // Fetch function types
    const { data: functionData } = await supabase
      .from('function_types')
      .select('*')

    if (contextData) contextTypes.set(contextData)
    if (resourceData) resourceTypes.set(resourceData)
    if (functionData) functionTypes.set(functionData)
  } catch (error) {
    console.error('Error fetching classification types:', error)
  }
}

export async function addLink(linkData: {
  title: string
  url: string
  description: string
  context_id: string
  resource_id: string
  function_id: string
}) {
  try {
    // First insert the link
    const { data: newLink, error: linkError } = await supabase
      .from('links')
      .insert([
        {
          title: linkData.title,
          url: linkData.url,
          description: linkData.description,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        },
      ])
      .select()
      .single()

    if (linkError) throw linkError

    // Then create the classification if context/resource/function are selected
    if (linkData.context_id || linkData.resource_id || linkData.function_id) {
      const classificationData: {
        site_id: number
        context_id?: number | null
        resource_id?: number | null
        function_id?: number | null
      } = {
        site_id: Number(newLink.id),
        ...(linkData.context_id && { context_id: Number(linkData.context_id) }),
        ...(linkData.resource_id && {
          resource_id: Number(linkData.resource_id),
        }),
        ...(linkData.function_id && {
          function_id: Number(linkData.function_id),
        }),
      }

      const { error: classError } = await supabase
        .from('site_classifications')
        .insert(classificationData)

      if (classError) throw classError
    }

    // Aggiorna lo store con il nuovo link
    links.set([newLink, ...links.get().slice(0, 4)])

    return { success: true }
  } catch (error: any) {
    console.error('Error adding link:', error)
    return { success: false, error: error.message }
  }
}

export async function addCollection(collectionData: {
  name: string
  description: string
  is_public: boolean
}) {
  try {
    const { data: newCollection, error } = await supabase
      .from('collections')
      .insert([
        {
          ...collectionData,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Aggiorna lo store con la nuova collezione
    collections.set([newCollection, ...collections.get().slice(0, 4)])

    return { success: true }
  } catch (error: any) {
    console.error('Error adding collection:', error)
    return { success: false, error: error.message }
  }
}
