export const QUERY_MAIN_TABLE = `
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
`