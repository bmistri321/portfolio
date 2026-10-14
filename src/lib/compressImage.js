// Shared in-browser image compression (canvas) for fast page loads.
// GIFs and SVGs pass through untouched (animation / vector). Raster images
// are resized to max 1600px and encoded as AVIF — much smaller than PNG/JPEG.
// Falls back to PNG/JPEG when the browser can't encode AVIF.
// Returns a File ready for upload.
const MAX_IMG_DIM = 1600;

export async function compressImage(file) {
  if (!file) return file;
  if (file.type === 'image/gif') return file;
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return optimizeSvg(file);
  }
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

// Lossless SVG optimization via SVGO: strips editor metadata, comments,
// empty groups and minifies paths. Falls back to the original file if
// anything fails.
export async function optimizeSvg(file) {
  try {
    const { optimize } = await import('svgo');
    const text = await file.text();
    const result = optimize(text, {
      multipass: true,
      floatPrecision: 2,
      plugins: [
        {
          name: 'preset-default',
          params: {
            overrides: {
              // Keep viewBox so the SVG scales correctly when resized.
              removeViewBox: false,
              // Aggressive but visually lossless path minification.
              convertPathData: { floatPrecision: 2 },
              cleanupNumericValues: { floatPrecision: 2 },
            },
          },
        },
        // Extra wins: drop hidden elements, reuse repeated paths.
        'removeOffCanvasPaths',
        'reusePaths',
        'removeEmptyContainers',
      ],
    });
    if (result && result.data && result.data.length < text.length) {
      return new File([result.data], file.name, { type: 'image/svg+xml' });
    }
  } catch {
    /* fall through to original */
  }
  return file;
}
