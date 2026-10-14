// Rewrites Supabase storage URLs to site-relative /media/ paths so the
// Supabase project URL never appears in public HTML.
const SUPABASE_STORAGE_PATTERN = /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/portfolio-media\//;

export function toProxyUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return addCloudinaryTransforms(url.replace(SUPABASE_STORAGE_PATTERN, '/media/'));
}

// Adds f_auto,q_auto to Cloudinary URLs missing them (auto AVIF/WebP + quality).
// Requires "Strict transformations" OFF in Cloudinary Settings > Security.
function addCloudinaryTransforms(url) {
  if (!url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/f_auto,q_auto/')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

// Rewrites Supabase storage URLs inside HTML content (img/video src attributes),
// and adds Cloudinary f_auto,q_auto where missing.
export function proxyMediaInHtml(html) {
  if (!html || typeof html !== 'string') return html;
  return html
    .replace(
      /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/portfolio-media\//g,
      '/media/'
    )
    .replace(
      /https:\/\/res\.cloudinary\.com\/[^"'\s>]+?\/upload\/(?!f_auto,q_auto\/)/g,
      (m) => m.replace('/upload/', '/upload/f_auto,q_auto/')
    );
}
