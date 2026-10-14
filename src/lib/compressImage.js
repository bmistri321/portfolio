// Shared in-browser image compression (canvas) for fast page loads.
// GIFs and SVGs pass through untouched (animation / vector). Raster images
// are resized to max 1600px and encoded as AVIF — much smaller than PNG/JPEG.
// Falls back to PNG/JPEG when the browser can't encode AVIF.
// Returns a File ready for upload.
const MAX_IMG_DIM = 1600;

export async function compressImage(file) {
  if (!file) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_IMG_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  try { bitmap.close(); } catch { /* noop */ }

  // AVIF first: keeps transparency, far smaller than PNG/JPEG.
  let blob = await new Promise((res) => canvas.toBlob(res, 'image/avif', 0.7));
  let outType = 'image/avif';
  let ext = '.avif';
  if (!blob) {
    // Browser can't encode AVIF — fall back to PNG (keeps transparency) or JPEG.
    outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    ext = outType === 'image/png' ? '.png' : '.jpg';
    blob = await new Promise((res) => canvas.toBlob(res, outType, 0.82));
  }
  if (!blob) return file;
  const name = file.name.replace(/\.[a-z0-9]+$/i, '') + ext;
  return new File([blob], name, { type: outType });
}
