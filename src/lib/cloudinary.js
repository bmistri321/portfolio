// Cloudinary unsigned uploads for fast image delivery (global CDN,
// automatic format + quality optimization). Falls back to Supabase storage
// when Cloudinary is unreachable.
const CLOUD_NAME = 'ovj5ffsn';
const UPLOAD_PRESET = 'portfolio_uploads';

export async function uploadToCloudinary(file) {
  const isVideo = file.type.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  // Store under a portfolio folder for organization.
  form.append('folder', 'portfolio');

  const res = await fetch(endpoint, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Cloudinary upload failed (${res.status})`);
  }
  const data = await res.json();
  if (!data.secure_url) throw new Error('Cloudinary upload returned no URL');
  return data.secure_url;
}

// Delivery URL with automatic format (AVIF/WebP) and quality optimization.
// Cloudinary picks the best format the visitor's browser supports.
// Requires "Strict transformations" OFF in Cloudinary Settings > Security.
export function optimizedCloudinaryUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/f_auto,q_auto:best/')) return url;
  // Upgrade older q_auto URLs — default q_auto softens screenshots.
  if (url.includes('/upload/f_auto,q_auto/')) return url.replace('/upload/f_auto,q_auto/', '/upload/f_auto,q_auto:best/');
  return url.replace('/upload/', '/upload/f_auto,q_auto:best/');
}

// Video delivery URL - raw (all video transforms are blocked on this account).
// Just repairs broken doubled transforms back to the working raw URL.
export function optimizedVideoUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/f_auto,q_auto/q_auto/', '/upload/')
            .replace('/upload/f_auto,q_auto:best/', '/upload/')
            .replace('/upload/f_auto,q_auto/', '/upload/')
            .replace('/upload/q_auto/', '/upload/');
}

// Poster: empty (video transforms blocked on this account).
// The <video> element's preload="metadata" shows the first frame natively.
export function cloudinaryVideoPoster(videoUrl) {
  return '';
}
