// Rewrites Supabase storage URLs to site-relative /media/ paths so the
// Supabase project URL never appears in public HTML.
const SUPABASE_STORAGE_PATTERN = /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/portfolio-media\//;

export function toProxyUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return addCloudinaryTransforms(url.replace(SUPABASE_STORAGE_PATTERN, '/media/'));
}

// Adds f_auto,q_auto:best to Cloudinary image URLs missing it (auto AVIF/WebP
// at best quality — default q_auto softens screenshots). Older q_auto URLs
// are upgraded. Video URLs stay raw (transforms blocked). Also repairs broken
// doubled transforms like f_auto,q_auto/q_auto. Requires "Strict
// transformations" OFF in Cloudinary Settings > Security.
function addCloudinaryTransforms(url) {
  if (!url.includes('res.cloudinary.com')) return url;
  const isVideo = url.includes('/video/upload/') || /\.(mp4|webm|mov)$/i.test(url.split('?')[0]);
  // Repair broken doubled transforms first
  let clean = url.replace('/upload/f_auto,q_auto/q_auto/', '/upload/');
  if (isVideo) {
    // Video transforms are all blocked - serve raw URL
    return clean.replace('/upload/f_auto,q_auto/q_auto/', '/upload/')
               .replace('/upload/f_auto,q_auto:best/', '/upload/')
               .replace('/upload/f_auto,q_auto/', '/upload/')
               .replace('/upload/q_auto/', '/upload/');
  }
  if (clean.includes('/upload/f_auto,q_auto:best/')) return clean;
  if (clean.includes('/upload/f_auto,q_auto/')) return clean.replace('/upload/f_auto,q_auto/', '/upload/f_auto,q_auto:best/');
  return clean.replace('/upload/', '/upload/f_auto,q_auto:best/');
}

// Rewrites Supabase storage URLs inside HTML content (img/video src attributes),
// adds Cloudinary f_auto,q_auto to images where missing, and repairs broken
// video URLs (doubled f_auto,q_auto/q_auto -> raw, since video transforms are blocked).
export function proxyMediaInHtml(html) {
  if (!html || typeof html !== 'string') return html;
  return html
    .replace(
      /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/portfolio-media\//g,
      '/media/'
    )
    // Repair broken doubled video transforms first
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
    )
    // Upgrade older q_auto image URLs to q_auto:best (videos already stripped above)
    .replace(/\/upload\/f_auto,q_auto\//g, '/upload/f_auto,q_auto:best/')
    // Add image transforms (skip URLs already having them; skip video URLs)
    .replace(
      /https:\/\/res\.cloudinary\.com\/(?!.*\/video\/upload\/)[^"'\s>]+?\/upload\/(?!f_auto,q_auto(?::best)?\/)/g,
      (m) => m.replace('/upload/', '/upload/f_auto,q_auto:best/')
    );
}
