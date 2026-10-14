// Proxies Supabase storage files through /media/ so the Supabase project URL
// never appears in public HTML, and forces inline display (not download).
export default async function handler(req, res) {
  const { path } = req.query;
  if (!path || typeof path !== 'string') {
    return res.status(400).send('Missing file path');
  }

  // Basic path safety: no directory traversal, no absolute URLs.
  if (path.includes('..') || path.startsWith('/') || path.includes('://')) {
    return res.status(400).send('Invalid file path');
  }

  const SUPABASE_URL = 'https://vieqhbbzndgyqwspgkmy.supabase.co';
  const target = `${SUPABASE_URL}/storage/v1/object/public/portfolio-media/${path}`;

  try {
    const upstream = await fetch(target);
    if (!upstream.ok) {
      return res.status(upstream.status).send('File not found');
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    // Inline display — open images/SVGs in the browser instead of downloading.
    res.setHeader('Content-Disposition', 'inline');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    // Cache for a day; files are content-addressed by timestamped names.
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');

    const buffer = Buffer.from(await upstream.arrayBuffer());
    return res.send(buffer);
  } catch (err) {
    console.error('Media proxy error:', err.message);
    return res.status(502).send('Upstream fetch failed');
  }
}
