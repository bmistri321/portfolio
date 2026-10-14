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
export function optimizedCloudinaryUrl(url, { width } = {}) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const transforms = ['f_auto', 'q_auto'];
  if (width) transforms.push(`w_${width}`, 'c_limit');
  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}
