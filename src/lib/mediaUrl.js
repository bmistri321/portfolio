// Rewrites Supabase storage URLs to site-relative /media/ paths so the
// Supabase project URL never appears in public HTML.
// Cloudinary URLs pass through EXACTLY as stored — Bishal prepares his
// files himself (ready-made AVIFs), so no format/quality transforms are
// added or upgraded at render. The one exception is repairing old broken
// doubled video transforms, which made videos unplayable.
const SUPABASE_STORAGE_PATTERN = /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/portfolio-media\//;

export function toProxyUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(SUPABASE_STORAGE_PATTERN, '/media/');
}

// Rewrites Supabase storage URLs inside HTML content (img/video src
// attributes) and repairs broken doubled video transforms
// (f_auto,q_auto/q_auto -> raw, since video transforms are blocked).
// Image URLs are left untouched, exactly as stored.
export function proxyMediaInHtml(html) {
  if (!html || typeof html !== 'string') return html;
  return html
    .replace(
      /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/portfolio-media\//g,
      '/media/'
    )
    .replace(
      /https:\/\/res\.cloudinary\.com\/[^"'\s>]*?\/upload\/f_auto,q_auto\/q_auto\//g,
      (m) => m.replace('/upload/f_auto,q_auto/q_auto/', '/upload/')
    )
    .replace(
      /https:\/\/res\.cloudinary\.com\/[^"'\s>]*?\/video\/upload\/f_auto,q_auto\//g,
      (m) => m.replace('/video/upload/f_auto,q_auto/', '/video/upload/')
    )
    .replace(
      /https:\/\/res\.cloudinary\.com\/[^"'\s>]*?\/video\/upload\/q_auto\//g,
      (m) => m.replace('/video/upload/q_auto/', '/video/upload/')
    );
}
