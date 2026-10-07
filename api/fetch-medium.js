// POST /api/fetch-medium  { url }   — or GET /api/fetch-medium?url=…
// Fetches a Medium article's title + full text via its official RSS feed.
// Pure read: no database access, no secrets. Used by the admin Writing
// editor for import and manual re-sync.
import { importFromMedium } from './_medium.js';

export default async function handler(req, res) {
  try {
    let url = null;
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      url = body.url;
    } else if (req.method === 'GET') {
      url = req.query?.url;
    } else {
      return res.status(405).json({ ok: false, error: 'Method not allowed.' });
    }
    if (!url || !String(url).trim()) {
      return res.status(400).json({ ok: false, error: 'Paste a Medium article link first.' });
    }
    const data = await importFromMedium(url);
    return res.status(200).json({ ok: true, ...data });
  } catch (e) {
    const status = e?.isMediumError ? 422 : 502;
    return res.status(status).json({ ok: false, error: e?.message || 'Could not fetch the article.' });
  }
}
