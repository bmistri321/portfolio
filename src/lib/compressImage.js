// Shared in-browser image compression (canvas). GIFs and SVGs pass through
// untouched (animation / vector). Returns a File ready for upload.
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
  const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise((res) => canvas.toBlob(res, outType, 0.82));
  if (!blob) return file;
  const name = file.name.replace(/\.[a-z0-9]+$/i, '') + (outType === 'image/png' ? '.png' : '.jpg');
  return new File([blob], name, { type: outType });
}
