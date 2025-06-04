import { supabaseQuery } from "~/scripts/db_old/supabase";

export const getSites = async () => {
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
      `
  })
}