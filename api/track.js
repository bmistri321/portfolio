// POST /api/track — visitor-tracking ingestion for bishalmistri.com.
// No GET data endpoint: admin reads site_visits directly from Supabase
// with an authenticated session, so visitor data is never exposed here.
// Location is derived server-side from Vercel geo headers only — no
// external IP API. The raw IP is never stored, only its SHA-256 hash
// (used for counting, never for identifying a person).
import { createHash } from 'node:crypto';

const MAX_BODY = 8192;

function str(v, max) {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

function boundedInt(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body !== undefined && req.body !== null) {
      if (typeof req.body === 'string') return resolve(req.body);
      try { return resolve(JSON.stringify(req.body)); } catch { return resolve(''); }
    }
    let size = 0;
    let data = '';
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        req.destroy();
        reject(new Error('Payload too large.'));
        return;
      }
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function decodeCity(raw) {
  if (!raw) return null;
  try { return decodeURIComponent(raw); } catch { return raw; }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed.' });
    }

    let payload;
    try {
      const raw = await readBody(req);
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      return res.status(400).json({ ok: false, error: 'Invalid payload.' });
    }
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ ok: false, error: 'Invalid payload.' });
    }

    const pagePath = str(payload.page_path, 500);
    if (!pagePath) {
      return res.status(400).json({ ok: false, error: 'page_path is required.' });
    }
    const visitorId = str(payload.visitor_id, 128);
    const sessionId = str(payload.session_id, 128);
    if (!visitorId || !sessionId) {
      return res.status(400).json({ ok: false, error: 'visitor_id and session_id are required.' });
    }

    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    const key = serviceKey || anonKey;
    if (!supabaseUrl || !key) {
      return res.status(503).json({ ok: false, error: 'Tracking is not configured.' });
    }
    const headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    };

    // Exit beacon: patch the still-open pageview for this visitor/session/path
    // with duration and scroll. This only works with a service-role key
    // (anon has INSERT only, by design); without it the pageview row from
    // entry is already stored, so a failed patch is not an error and must
    // never create a duplicate row.
    if (payload.is_exit === true) {
      if (!serviceKey) return res.status(200).json({ ok: true });
      try {
        const q = new URL(`${supabaseUrl}/rest/v1/site_visits`);
        q.searchParams.set('select', 'id');
        q.searchParams.set('visitor_id', `eq.${visitorId}`);
        q.searchParams.set('session_id', `eq.${sessionId}`);
        q.searchParams.set('page_path', `eq.${pagePath}`);
        q.searchParams.set('duration_seconds', 'is.null');
        q.searchParams.set('order', 'created_at.desc');
        q.searchParams.set('limit', '1');
        const found = await fetch(q.toString(), { headers: { apikey: key, Authorization: `Bearer ${key}` } });
        if (found.ok) {
          const rows = await found.json();
          if (rows && rows[0] && rows[0].id) {
            await fetch(`${supabaseUrl}/rest/v1/site_visits?id=eq.${encodeURIComponent(rows[0].id)}`, {
              method: 'PATCH',
              headers,
              body: JSON.stringify({
                duration_seconds: boundedInt(payload.duration_seconds, 0, 86400),
                max_scroll: boundedInt(payload.max_scroll, 0, 100),
              }),
            });
          }
        }
      } catch {
        // Best effort only; the pageview itself was already stored.
      }
      return res.status(200).json({ ok: true });
    }

    // Geo headers set by Vercel on every request (approximate, city-level).
    const h = req.headers || {};
    const countryCode = str(h['x-vercel-ip-country'], 8);
    const latRaw = Number(h['x-vercel-ip-latitude']);
    const lngRaw = Number(h['x-vercel-ip-longitude']);
    const latitude = Number.isFinite(latRaw) && latRaw >= -90 && latRaw <= 90 ? latRaw : null;
    const longitude = Number.isFinite(lngRaw) && lngRaw >= -180 && lngRaw <= 180 ? lngRaw : null;

    // Raw IP is hashed only — never stored, logged, or returned.
    const forwarded = str(h['x-forwarded-for'], 256);
    const rawIp = forwarded ? forwarded.split(',')[0].trim() : str(h['x-real-ip'], 128);
    const ipHash = rawIp ? createHash('sha256').update(rawIp).digest('hex') : null;

    const row = {
      visitor_id: visitorId,
      session_id: sessionId,
      page_path: pagePath,
      referrer: str(payload.referrer, 1000),
      utm_source: str(payload.utm_source, 200),
      utm_medium: str(payload.utm_medium, 200),
      utm_campaign: str(payload.utm_campaign, 200),
      country: countryCode,
      country_code: countryCode,
      region: str(h['x-vercel-ip-country-region'], 200),
      city: decodeCity(str(h['x-vercel-ip-city'], 200)),
      latitude,
      longitude,
      timezone: str(h['x-vercel-ip-timezone'], 100),
      device: str(payload.device, 50),
      browser: str(payload.browser, 50),
      os: str(payload.os, 50),
      screen: str(payload.screen, 50),
      language: str(payload.language, 20),
      ip_hash: ipHash,
      duration_seconds: null,
      max_scroll: null,
    };

    const r = await fetch(`${supabaseUrl}/rest/v1/site_visits`, {
      method: 'POST',
      headers,
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      return res.status(503).json({ ok: false, error: 'Tracking is temporarily unavailable.' });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(503).json({ ok: false, error: 'Tracking is temporarily unavailable.' });
  }
}
