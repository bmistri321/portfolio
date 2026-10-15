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
  if (url.includes('/upload/f_auto,q_auto/')) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

// Video delivery URL - uses streaming-friendly transforms, no image-only params.
export function optimizedVideoUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  // q_auto for quality; f_auto would transcode - keep original format for compatibility
  if (url.includes('/upload/q_auto/')) return url;
  return url.replace('/upload/', '/upload/q_auto/');
}

// Auto-generated poster thumbnail for Cloudinary videos (first frame as JPG).
export function cloudinaryVideoPoster(videoUrl) {
  if (!videoUrl || !videoUrl.includes('res.cloudinary.com')) return '';
  // Replace video upload with image thumbnail of first frame
  // Format: .../video/upload/.../public_id.ext -> .../video/upload/so_0,f_jpg/public_id.jpg
  const m = videoUrl.match(/(https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(?:[^/]+\/)*(.+)\.\w+$/);
  if (!m) return '';
  return `${m[1]}so_0,f_jpg/${m[2]}.jpg`;
}
