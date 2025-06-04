import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'
import { supabaseUpdate, supabaseQuery, supabaseInsert, supabaseDelete } from '~/scripts/db_old/supabase'


export const GET: APIRoute = async ({ url }) => {
  return handleRequest('GET', url)
};

export const POST: APIRoute = async ({ request, url }) => {
  return handleRequest('POST', url, request)
};

export const PUT: APIRoute = async ({ request, url }) => {
  return handleRequest('PUT', url, request)
};

export const DELETE: APIRoute = async ({ url }) => {
  return handleRequest('DELETE', url)
}



const handleRequest = async (method: string, url: URL, request?: Request) => {

  const { type, ...params } = Object.fromEntries(url.searchParams)

  try {

    const response = await handleApiRequest(method, type, params, request)

    return new Response(JSON.stringify(response), { status: 200 })

  } catch (error) {

    return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  }
}

const handleApiRequest = async (method: string, type: string, params: any, request?: Request) => {

  switch (type) {

    /* @@ -- GET methods -- @@ */

    case 'getAreas':
      if (method !== 'GET') throw new Error('Invalid method for getAreas')
      const getAreasData = request ? await request.json() : {}
      return getAreas()

    case 'getCategories':
      if (method !== 'GET') throw new Error('Invalid method for getCategories')
      const getCategoriesData = request ? await request.json() : {}
      return getCategories()

    case 'getLists':
      if (method !== 'GET') throw new Error('Invalid method for getCategories')
      const getListsData = request ? await request.json() : {}
      return getLists()

    case 'getCategoriesJson':
      if (method !== 'GET') throw new Error('Invalid method for getCategoriesJson')
      const getAllCategoriesData = request ? await request.json() : {}
      return getCategoriesJson()

    case 'getEvents':
      if (method !== 'GET') throw new Error('Invalid method for getEvents')
      const getEventsData = request ? await request.json() : {}
      return getEvents()

    case 'getSites':
      if (method !== 'GET') throw new Error('Invalid method for getSites')
      const getSitesData = request ? await request.json() : {}
      return getSites()

    case 'getSiteById':
      if (method !== 'GET') throw new Error('Invalid method for getSiteById')
      const { id } = params
      if (!id) throw new Error('ID is required for getSiteById')
      return getSite(id)

    case 'getSubCategories':
      if (method !== 'GET') throw new Error('Invalid method for getSubCategories')
      const getSubCategoriesData = request ? await request.json() : {}
      return getSubCategories()

    case 'getTags':
      if (method !== 'GET') throw new Error('Invalid method for getTags')
      const getSitesTagsData = request ? await request.json() : {}
      return getTags()

    /* @@ -- POST methods -- @@ */

    case 'insertEvent':
      if (method !== 'POST') throw new Error('Invalid method for insertEvent')
      const insertData = request ? await request.json() : {}
      return insertEvent(insertData)

    /* @@ -- PUT methods -- @@ */

    case 'updateEvent':
      if (method !== 'PUT') throw new Error('Invalid method for updateEvent')
      const updateData = request ? await request.json() : {}
      return updateEvent(updateData, updateData.id)

    /* @@ -- DEL methods -- @@ */

    case 'deleteEvent':
      if (method !== 'DELETE') throw new Error('Invalid method for deleteEvent')
      const deleteData = params ? params.id : {}
      console.log('uhmm', deleteData)
      return deleteEvent(deleteData, deleteData.id)

    case 'deleteSite':
      if (method !== 'DELETE') throw new Error('Invalid method for deleteEvent')
      const deleteSiteData = params ? params.id : {}
      console.log('debug delete site id', deleteSiteData)
      return deleteSite(deleteSiteData)



    default:
      throw new Error('Unknown API request type')
  }
}

/* @@ -- GET methods -- @@ */

const getAreas = async () => {
  return await supabaseQuery('areas', {
    select: `
      id_area,
      area
    `,
    order: {
      column: 'id_area', // Colonna da ordinare
      ascending: true    // Ordine ascendente (true) o discendente (false)
    }
  })
}

const getCategories = async () => {
  return await supabaseQuery('categories', {
    select: `
      id,
      category
    `,
    order: {
      column: 'id',
      ascending: true
    }
  })
}

const getLists = async () => {
  return await supabaseQuery('lists_users', {
    select: `
      id,
      name,
      id_user,
      created_at,
      modified_at,
      public,
      description
    `,
    order: {
      column: 'created_at',
      ascending: true
    }
  })
}

const getCategoriesJson = async () => {
  return await supabaseQuery('sub_categories', {
    select: `
      id,
      sub_category,
      id_category,
      categories (
        category,
        id_area (
          area
        )
      )
    `,
    order: {
      column: 'id',
      ascending: true
    }
  })
}

const getEvents = async () => {
  return supabaseQuery('event_log', {
    select: `
      id,
      user_id,
      event_data,
      event_type (        
        event_type, 
        event_description
      ),
      event_family (
        event_family
      )
    `
  })
}

const getSite = async (id: string | number) => {
  return await supabaseQuery('main_table', {
    select: `
      id,
      description,
      icon,
      image,
      logo,
      name,
      title,
      url
    `,
    filter: (query) => query.eq('id', id)
  })
}

const getSites = async () => {
  return await supabaseQuery('main_table', {
    select: `
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
    `,
    order: {
      column: 'id',
      ascending: false
    }
  })
}

const getSubCategories = async () => {
  return await supabaseQuery('sub_categories', {
    select: `
      id,
      id_category,
      sub_category
    `,
    order: {
      column: 'id',
      ascending: true
    }
  })
}

const getTags = async () => {
  return await supabaseQuery('categories_tags', {
    select: `
      id_src,
      id_area,      
      id_cat,
      tag_3,
      tag_4,
      tag_5 
    `,
    order: {
      column: 'id_src',
      ascending: true
    }
  })
}

/* @@ -- POST methods -- @@ */

const insertEvent = async (data: any) => {
  const tableName = 'event_log'
  const result = await supabaseInsert(tableName, data)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

/* @@ -- PUT methods -- @@ */

const updateEvent = async (data: any, id: string) => {
  const tableName = 'event_log'
  const result = await supabaseUpdate(tableName, data, (query) => query.eq('id', parseInt(id)))
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

const updateElement = async (tableName: string, data: any, id: string) => {
  //const tableName = 'event_log'
  const result = await supabaseUpdate(tableName, data, (query) => query.eq('id', parseInt(id)))
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

const updateEventCopy = async (data: any, id: string) => {
  const tableName = 'event_log'
  const result = await supabaseUpdate(tableName, data, (query) => query.eq('id', parseInt(id)))
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}

/* @@ -- DEL methods -- @@ */

export const deleteEventNew = async (id: any) => {

  console.log('deleteEvent called with id:', id) //FIXME

  if (!id) {
    throw new Error('ID parameter is required but was undefined')
  }

  const numericId = Number(id)

  console.log('Converted numericId:', numericId) // Debug log

  if (isNaN(numericId)) {
    throw new Error(`Invalid ID format: ${id}`)
  }

  const tableName = 'event_log'
  console.log('siamo arrivati fino a qui')
  const result = await supabaseDelete(tableName, (query) => {
    console.log('Building query with ID:', numericId) // Debug log
    return query.eq('id', numericId)
  })

  return result.data
}

export const deleteSite = async (id: any) => {

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

const deleteEventOld1 = async (data: any) => {

  let id = data.id
  console.log('deleteEvent called with id:', id); // Debug log 1
  //console.log('deleteEvent data param:', data);   // Debug log 2

  const tableName = 'event_log'

  // Guard clause for undefined id
  if (!id) {
    throw new Error('ID parameter is required but was undefined')
  }

  const numericId = Number(id);
  console.log('Converted numericId:', numericId) // Debug log 3

  if (isNaN(numericId)) {
    throw new Error(`Invalid ID format: ${id}`)
  }

  const result = await supabaseDelete(tableName, (query) => {
    console.log('Building query with ID:', numericId)// Debug log 4
    return query.eq('id', numericId)
  });

  return result.data
}


const deleteEvent = async (data: any, id: any) => {
  console.log(data, id)
  const tableName = 'event_log'
  //const my_id = BigInt(id)
  const numericId = Number(id)
  const result = await supabaseDelete(tableName, (query) => query.eq('id', data))
  if (!result.success) {
    //console.log('iddddd', data)
    throw new Error(result.error)
  }
  return result.data
}


