// Rewrites Supabase storage URLs to site-relative /media/ paths so the
// Supabase project URL never appears in public HTML.
const SUPABASE_STORAGE_PATTERN = /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/portfolio-media\//;

export function toProxyUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(SUPABASE_STORAGE_PATTERN, '/media/');
}

// Rewrites Supabase storage URLs inside HTML content (img/video src attributes).
export function proxyMediaInHtml(html) {
  if (!html || typeof html !== 'string') return html;
  return html.replace(
    /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/portfolio-media\//g,
    '/media/'
  );
}
