// Rewrites Supabase storage URLs to site-relative /media/ paths so the
// Supabase project URL never appears in public HTML.
const SUPABASE_STORAGE_PATTERN = /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/portfolio-media\//;

export function toProxyUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return addCloudinaryTransforms(url.replace(SUPABASE_STORAGE_PATTERN, '/media/'));
}

// Adds f_auto,q_auto to Cloudinary image URLs missing them (auto AVIF/WebP + quality).
// Video URLs get q_auto only (no image transforms). Also repairs broken doubled
// transforms like f_auto,q_auto/q_auto. Requires "Strict transformations" OFF
// in Cloudinary Settings > Security.
function addCloudinaryTransforms(url) {
  if (!url.includes('res.cloudinary.com')) return url;
  const isVideo = url.includes('/video/upload/') || /\.(mp4|webm|mov)$/i.test(url.split('?')[0]);
  // Repair broken doubled transforms first
  let clean = url.replace('/upload/f_auto,q_auto/q_auto/', '/upload/');
  if (isVideo) {
    // Video transforms are all blocked - serve raw URL
    return clean.replace('/upload/f_auto,q_auto/q_auto/', '/upload/')
               .replace('/upload/f_auto,q_auto/', '/upload/')
               .replace('/upload/q_auto/', '/upload/');
  }
  if (clean.includes('/upload/f_auto,q_auto/')) return clean;
  return clean.replace('/upload/', '/upload/f_auto,q_auto/');
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
